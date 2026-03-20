"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  buildLinePath,
  CHART_HEIGHT,
  CHART_PADDING,
  CHART_WIDTH,
  clamp,
} from "@/components/landing-page/helpers";
import type {
  CaretStyle,
  ChartData,
  CharacterState,
  ErrorEvent,
  PerformancePoint,
  ResultMetrics,
  TestMetrics,
} from "@/components/landing-page/types";
import type { Player, RoomState, ServerEvent } from "@repo/shared";

const WS_URL = process.env.NEXT_PUBLIC_WS_URL ?? "ws://localhost:3001";

function useTestMetrics(
  typedText: string,
  passage: string,
  elapsedSeconds: number,
  errorCount: number,
): TestMetrics {
  return useMemo(() => {
    const correctChars = typedText
      .split("")
      .filter((char, index) => char === passage[index]).length;
    const accuracyBase = correctChars + errorCount;
    const accuracy = accuracyBase > 0
      ? Math.round((correctChars / accuracyBase) * 100)
      : 100;
    const words = correctChars / 5;
    const wpm = Math.round(words / (elapsedSeconds / 60));

    return {
      accuracy,
      wpm: Number.isFinite(wpm) ? wpm : 0,
    };
  }, [elapsedSeconds, errorCount, passage, typedText]);
}

function useResultMetrics(
  typedText: string,
  passage: string,
  elapsedSeconds: number,
  performanceHistory: PerformancePoint[],
  metrics: TestMetrics,
  errorCount: number,
): ResultMetrics {
  return useMemo(() => {
    const correctChars = typedText
      .split("")
      .filter((char, index) => char === passage[index]).length;
    const incorrectChars = errorCount;
    const rawWpm = Math.round((typedText.length / 5 / elapsedSeconds) * 60);
    const consistencySamples = performanceHistory.map((point) => point.wpm);
    const averageWpm =
      consistencySamples.length > 0
        ? consistencySamples.reduce((sum, pointWpm) => sum + pointWpm, 0) /
          consistencySamples.length
        : metrics.wpm;
    const averageDeviation =
      consistencySamples.length > 0
        ? consistencySamples.reduce(
            (sum, pointWpm) => sum + Math.abs(pointWpm - averageWpm),
            0,
          ) / consistencySamples.length
        : 0;
    const consistency =
      averageWpm > 0
        ? Math.max(0, Math.round(100 - (averageDeviation / averageWpm) * 100))
        : 100;

    return {
      correctChars,
      incorrectChars,
      rawWpm: Number.isFinite(rawWpm) ? rawWpm : 0,
      consistency,
      errors: errorCount,
    };
  }, [elapsedSeconds, errorCount, metrics.wpm, passage, performanceHistory, typedText]);
}

function useChartData(
  duration: number,
  performanceHistory: PerformancePoint[],
  errorEvents: ErrorEvent[],
): ChartData | null {
  return useMemo(() => {
    if (performanceHistory.length === 0) {
      return null;
    }

    const chartInnerWidth = CHART_WIDTH - CHART_PADDING.left - CHART_PADDING.right;
    const chartInnerHeight = CHART_HEIGHT - CHART_PADDING.top - CHART_PADDING.bottom;
    const maxY = Math.max(40, ...performanceHistory.flatMap((point) => [point.wpm, point.rawWpm]));
    const yMax = Math.ceil(maxY / 10) * 10;

    const toX = (second: number) =>
      CHART_PADDING.left +
      ((second - 1) / Math.max(duration - 1, 1)) * chartInnerWidth;
    const toY = (value: number) =>
      CHART_PADDING.top + chartInnerHeight - (value / yMax) * chartInnerHeight;

    const wpmPoints = performanceHistory.map((point) => ({
      x: toX(point.second),
      y: toY(point.wpm),
      point,
    }));
    const rawPoints = performanceHistory.map((point) => ({
      x: toX(point.second),
      y: toY(point.rawWpm),
      point,
    }));
    const errorMarkers = Array.from(new Set(errorEvents.map((event) => event.second)))
      .map((second) => {
        const point =
          rawPoints.find((entry) => entry.point.second === second) ??
          wpmPoints.find((entry) => entry.point.second === second);

        if (!point) {
          return null;
        }

        return {
          second,
          x: point.x,
          y: point.y,
        };
      })
      .filter((marker): marker is NonNullable<typeof marker> => marker !== null);

    return {
      yMax,
      gridLines: [0, yMax * 0.25, yMax * 0.5, yMax * 0.75, yMax].map((value) => ({
        value: Math.round(value),
        y: toY(value),
      })),
      wpmPoints,
      rawPoints,
      errorMarkers,
      wpmPath: buildLinePath(wpmPoints, toY(0)),
      rawPath: buildLinePath(rawPoints, toY(0)),
    };
  }, [duration, errorEvents, performanceHistory]);
}

function mergePlayerProgress(
  players: Player[],
  updates: Extract<ServerEvent, { type: "progress_update" }>,
) {
  const updateMap = new Map(updates.players.map((player) => [player.connId, player]));

  return players.map((player) => {
    const nextPlayer = updateMap.get(player.connId);

    if (!nextPlayer) {
      return player;
    }

    return {
      ...player,
      progress: nextPlayer.progress,
      wpm: nextPlayer.wpm,
    };
  });
}

function mergePlayerFinish(
  players: Player[],
  event: Extract<ServerEvent, { type: "player_finished" }>,
) {
  return players.map((player) =>
    player.connId === event.connId
      ? {
          ...player,
          finishTime: event.timeMs,
          rank: event.rank,
          wpm: event.wpm,
          progress: 100,
        }
      : player,
  );
}

function mergeRaceResults(
  players: Player[],
  event: Extract<ServerEvent, { type: "race_results" }>,
) {
  const rankingMap = new Map(event.rankings.map((entry) => [entry.connId, entry]));

  return players.map((player) => {
    const ranking = rankingMap.get(player.connId);

    if (!ranking) {
      return player;
    }

    return {
      ...player,
      rank: ranking.rank,
      finishTime: ranking.timeMs,
      wpm: ranking.wpm,
    };
  });
}

export function useRaceRoom(roomId: string) {
  const [myConnId, setMyConnId] = useState<string | null>(null);
  const [roomState, setRoomState] = useState<RoomState>("lobby");
  const [players, setPlayers] = useState<Player[]>([]);
  const [passage, setPassage] = useState("");
  const [hostConnId, setHostConnId] = useState<string | null>(null);
  const [raceCount, setRaceCount] = useState(0);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [raceStartedAt, setRaceStartedAt] = useState<number | null>(null);
  const [hasJoined, setHasJoined] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [typedText, setTypedText] = useState("");
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [performanceHistory, setPerformanceHistory] = useState<PerformancePoint[]>([]);
  const [errorEvents, setErrorEvents] = useState<ErrorEvent[]>([]);
  const [caretStyle, setCaretStyle] = useState<CaretStyle>({
    left: 0,
    top: 0,
    height: 0,
  });
  const [wpmHistory, setWpmHistory] = useState<Map<string, number[]>>(new Map());
  const [isTypingFocused, setIsTypingFocused] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [trailingErrorCount, setTrailingErrorCount] = useState(0);

  const wsRef = useRef<WebSocket | null>(null);
  const pendingNameRef = useRef<string | null>(null);
  const queuedJoinNameRef = useRef<string | null>(null);
  const myConnIdRef = useRef<string | null>(null);
  const connectionErrorRef = useRef<string | null>(null);
  const typedTextRef = useRef("");
  const elapsedSecondsRef = useRef(0);
  const passageRef = useRef("");
  const errorEventsRef = useRef<ErrorEvent[]>([]);
  const startTimeRef = useRef<number | null>(null);
  const countdownClearTimerRef = useRef<number | null>(null);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const textSurfaceRef = useRef<HTMLDivElement>(null);
  const characterRefs = useRef<Array<HTMLSpanElement | null>>([]);

  const elapsedForMetrics = hasStarted ? Math.max(elapsedSeconds, 1) : 1;
  const activeChartDuration = Math.max(
    elapsedSeconds,
    performanceHistory.at(-1)?.second ?? 1,
  );
  const metrics = useTestMetrics(typedText, passage, elapsedForMetrics, errorEvents.length);
  const resultMetrics = useResultMetrics(
    typedText,
    passage,
    elapsedForMetrics,
    performanceHistory,
    metrics,
    errorEvents.length,
  );
  const chartData = useChartData(activeChartDuration, performanceHistory, errorEvents);
  const isHost = myConnId !== null && myConnId === hostConnId;
  const myPlayer = players.find((player) => player.connId === myConnId) ?? null;

  useEffect(() => {
    typedTextRef.current = typedText;
  }, [typedText]);

  useEffect(() => {
    elapsedSecondsRef.current = elapsedSeconds;
  }, [elapsedSeconds]);

  useEffect(() => {
    passageRef.current = passage;
  }, [passage]);

  useEffect(() => {
    errorEventsRef.current = errorEvents;
  }, [errorEvents]);

  useEffect(() => {
    myConnIdRef.current = myConnId;
  }, [myConnId]);

  useEffect(() => {
    connectionErrorRef.current = connectionError;
  }, [connectionError]);

  const resetLocalTyping = useCallback(() => {
    setTypedText("");
    setElapsedSeconds(0);
    setIsRunning(false);
    setIsFinished(false);
    setHasStarted(false);
    setPerformanceHistory([]);
    setErrorEvents([]);
    setIsTypingFocused(false);
    setShowErrorModal(false);
    setTrailingErrorCount(0);
    startTimeRef.current = null;
  }, []);

  const buildPerformancePoint = useCallback((second: number): PerformancePoint => {
    const currentText = typedTextRef.current;
    const currentPassage = passageRef.current;
    const correctChars = currentText
      .split("")
      .filter((char, index) => char === currentPassage[index]).length;
    const errorCount = errorEventsRef.current.filter((event) => event.second <= second).length;
    const accuracyBase = correctChars + errorCount;
    const accuracy = accuracyBase > 0
      ? Math.round((correctChars / accuracyBase) * 100)
      : 100;
    const wpm = Math.round((correctChars / 5 / second) * 60);
    const rawWpm = Math.round((currentText.length / 5 / second) * 60);

    return {
      second,
      wpm: Number.isFinite(wpm) ? wpm : 0,
      rawWpm: Number.isFinite(rawWpm) ? rawWpm : 0,
      accuracy,
      errorCount,
    };
  }, []);

  const recordPerformancePoint = useCallback((second: number) => {
    const safeSecond = clamp(second, 1, Math.max(second, 1));

    setPerformanceHistory((currentHistory) => {
      const nextPoint = buildPerformancePoint(safeSecond);
      const existingIndex = currentHistory.findIndex((point) => point.second === safeSecond);

      if (existingIndex === -1) {
        return [...currentHistory, nextPoint];
      }

      const nextHistory = [...currentHistory];
      nextHistory[existingIndex] = nextPoint;
      return nextHistory;
    });
  }, [buildPerformancePoint]);

  const focusTypingArea = useCallback(() => {
    window.requestAnimationFrame(() => {
      if (!isFinished) {
        textareaRef.current?.focus();
      }
    });
  }, [isFinished]);

  const getCharacterState = useCallback(
    (index: number): CharacterState => {
      const typedChar = typedText[index];

      if (typedChar === undefined) {
        return "pending";
      }

      return typedChar === passage[index] ? "correct" : "incorrect";
    },
    [passage, typedText],
  );

  useLayoutEffect(() => {
    const container = textSurfaceRef.current;

    if (!container || passage.length === 0) {
      return;
    }

    const currentIndex = Math.min(typedText.length, passage.length - 1);
    const currentCharacter = characterRefs.current[currentIndex];
    const previousCharacter =
      typedText.length > 0 ? characterRefs.current[typedText.length - 1] : null;
    const containerRect = container.getBoundingClientRect();
    const targetRect = (typedText.length >= passage.length ? previousCharacter : currentCharacter)
      ?.getBoundingClientRect();

    if (!targetRect) {
      return;
    }

    setCaretStyle({
      left:
        typedText.length >= passage.length
          ? targetRect.right - containerRect.left
          : targetRect.left - containerRect.left,
      top: targetRect.top - containerRect.top,
      height: targetRect.height,
    });
  }, [isFinished, passage, typedText]);

  useEffect(() => {
    function updateCaretOnResize() {
      const container = textSurfaceRef.current;

      if (!container || passage.length === 0) {
        return;
      }

      const currentIndex = Math.min(typedText.length, passage.length - 1);
      const currentCharacter = characterRefs.current[currentIndex];
      const previousCharacter =
        typedText.length > 0 ? characterRefs.current[typedText.length - 1] : null;
      const containerRect = container.getBoundingClientRect();
      const targetRect = (typedText.length >= passage.length ? previousCharacter : currentCharacter)
        ?.getBoundingClientRect();

      if (!targetRect) {
        return;
      }

      setCaretStyle({
        left:
          typedText.length >= passage.length
            ? targetRect.right - containerRect.left
            : targetRect.left - containerRect.left,
        top: targetRect.top - containerRect.top,
        height: targetRect.height,
      });
    }

    window.addEventListener("resize", updateCaretOnResize);
    return () => window.removeEventListener("resize", updateCaretOnResize);
  }, [passage, typedText]);

  useEffect(() => {
    if (!isRunning) {
      return;
    }

    const timer = window.setInterval(() => {
      const startedAt = startTimeRef.current;

      if (!startedAt) {
        return;
      }

      const nextElapsed = Math.max(1, Math.floor((Date.now() - startedAt) / 1000));
      setElapsedSeconds(nextElapsed);
      recordPerformancePoint(nextElapsed);
    }, 1000);

    return () => window.clearInterval(timer);
  }, [isRunning, recordPerformancePoint]);

  useEffect(() => {
    if (!roomId) {
      return;
    }

    const socket = new WebSocket(`${WS_URL}/race/${roomId}`);
    wsRef.current = socket;

    socket.addEventListener("open", () => {
      setIsConnected(true);
      setConnectionError(null);

      const queuedName = queuedJoinNameRef.current;
      if (queuedName) {
        socket.send(JSON.stringify({ type: "join", name: queuedName }));
        queuedJoinNameRef.current = null;
      }
    });

    socket.addEventListener("close", () => {
      setIsConnected(false);
      if (!connectionErrorRef.current) {
        setConnectionError((currentError) => currentError ?? "Connection closed");
      }
    });

    socket.addEventListener("error", () => {
      setIsConnected(false);
      setConnectionError((currentError) => currentError ?? "Unable to connect to the race room");
    });

    socket.addEventListener("message", (message) => {
      let event: ServerEvent;

      try {
        event = JSON.parse(message.data as string) as ServerEvent;
      } catch {
        return;
      }

      switch (event.type) {
        case "room_state": {
          setRoomState(event.state);
          setPassage(event.passage);
          setPlayers(event.players);
          setHostConnId(event.hostConnId);
          setRaceCount(event.raceCount);

          if (!myConnIdRef.current && pendingNameRef.current) {
            const me = event.players.find((player) => player.name === pendingNameRef.current);
            if (me) {
              setMyConnId(me.connId);
            }
          }

          break;
        }
        case "player_joined":
          setPlayers((currentPlayers) => {
            if (currentPlayers.some((player) => player.connId === event.player.connId)) {
              return currentPlayers;
            }

            return [...currentPlayers, event.player];
          });
          break;
        case "player_left":
          setPlayers((currentPlayers) =>
            currentPlayers.filter((player) => player.connId !== event.connId),
          );
          setWpmHistory((currentHistory) => {
            if (!currentHistory.has(event.connId)) {
              return currentHistory;
            }

            const nextHistory = new Map(currentHistory);
            nextHistory.delete(event.connId);
            return nextHistory;
          });
          break;
        case "countdown_tick":
          setCountdown(event.remaining);

          if (countdownClearTimerRef.current) {
            window.clearTimeout(countdownClearTimerRef.current);
          }

          if (event.remaining === 0) {
            countdownClearTimerRef.current = window.setTimeout(() => {
              setCountdown(null);
            }, 600);
          }
          break;
        case "race_started":
          setPassage(event.passage);
          setRaceStartedAt(event.startedAt);
          resetLocalTyping();
          setRoomState("racing");
          break;
        case "progress_update":
          setPlayers((currentPlayers) => mergePlayerProgress(currentPlayers, event));
          setWpmHistory((currentHistory) => {
            const nextHistory = new Map(currentHistory);

            event.players.forEach((player) => {
              const samples = nextHistory.get(player.connId) ?? [];
              const nextSamples = [...samples, player.wpm].slice(-12);
              nextHistory.set(player.connId, nextSamples);
            });

            return nextHistory;
          });
          break;
        case "player_finished":
          setPlayers((currentPlayers) => mergePlayerFinish(currentPlayers, event));
          break;
        case "race_results":
          setRoomState("results");
          setIsRunning(false);
          setCountdown(null);
          setPlayers((currentPlayers) => mergeRaceResults(currentPlayers, event));
          break;
        case "error":
          setConnectionError(event.message);
          break;
        default:
          break;
      }
    });

    return () => {
      if (countdownClearTimerRef.current) {
        window.clearTimeout(countdownClearTimerRef.current);
      }

      socket.close();
      wsRef.current = null;
    };
  }, [resetLocalTyping, roomId]);

  useEffect(() => {
    if (roomState === "racing" && hasJoined) {
      focusTypingArea();
    }
  }, [focusTypingArea, hasJoined, roomState, raceCount]);

  useEffect(() => {
    if (!isFinished) {
      return;
    }

    textareaRef.current?.blur();
  }, [isFinished]);

  const join = useCallback((name: string) => {
    pendingNameRef.current = name;
    setHasJoined(true);

    const socket = wsRef.current;
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify({ type: "join", name }));
      return;
    }

    queuedJoinNameRef.current = name;
  }, []);

  const startRace = useCallback(() => {
    const socket = wsRef.current;

    if (!socket || socket.readyState !== WebSocket.OPEN) {
      return;
    }

    socket.send(JSON.stringify({ type: "start_race" }));
  }, []);

  const sendProgress = useCallback((progress: number, wpm: number) => {
    const socket = wsRef.current;

    if (!socket || socket.readyState !== WebSocket.OPEN) {
      return;
    }

    socket.send(JSON.stringify({
      type: "keystroke",
      progress,
      wpm,
    }));
  }, []);

  const sendFinish = useCallback((wpm: number, timeMs: number) => {
    const socket = wsRef.current;

    if (!socket || socket.readyState !== WebSocket.OPEN) {
      return;
    }

    socket.send(JSON.stringify({
      type: "finish",
      wpm,
      timeMs,
    }));
  }, []);

  const getCurrentSecond = useCallback(() => Math.max(elapsedSecondsRef.current, 1), []);

  const handleTypingChange = useCallback((value: string) => {
    if (isFinished || roomState !== "racing") {
      return;
    }

    if (!hasStarted && value.length > 0) {
      startTimeRef.current = Date.now();
      setHasStarted(true);
      setIsRunning(true);
      setIsFinished(false);
    }

    const nextValue = value.slice(0, passage.length);
    const currentSecond = getCurrentSecond();
    const currentErrorCount = nextValue
      .split("")
      .reduce((count, char, index) => count + (char !== passage[index] ? 1 : 0), 0);
    const correctChars = nextValue
      .split("")
      .filter((char, index) => char === passage[index]).length;
    const wpm = Math.round((correctChars / 5 / currentSecond) * 60);
    const safeWpm = Number.isFinite(wpm) ? wpm : 0;
    const progress = passage.length
      ? Math.round((nextValue.length / passage.length) * 100)
      : 0;

    if (nextValue.length > typedText.length) {
      const nextErrors: ErrorEvent[] = [];

      for (let index = typedText.length; index < nextValue.length; index += 1) {
        if (nextValue[index] !== passage[index]) {
          nextErrors.push({ second: currentSecond, index });
        }
      }

      if (nextErrors.length > 0) {
        setErrorEvents((currentEvents) => [...currentEvents, ...nextErrors]);
      }
    }

    if (currentErrorCount > 0) {
      setTrailingErrorCount((currentCount) => {
        const nextCount = currentCount + 1;

        if (nextCount >= 7) {
          setShowErrorModal(true);
        }

        return nextCount;
      });
    } else {
      setTrailingErrorCount(0);
      setShowErrorModal(false);
    }

    setTypedText(nextValue);
    sendProgress(progress, safeWpm);

    if (nextValue.length >= passage.length && passage.length > 0 && currentErrorCount === 0) {
      const timeMs = raceStartedAt ? Date.now() - raceStartedAt : 0;
      const finalElapsed = startTimeRef.current
        ? Math.max(1, Math.ceil((Date.now() - startTimeRef.current) / 1000))
        : Math.max(1, Math.ceil(timeMs / 1000));

      setElapsedSeconds(finalElapsed);
      recordPerformancePoint(finalElapsed);
      setIsRunning(false);
      setIsFinished(true);
      setIsTypingFocused(false);
      sendFinish(safeWpm, timeMs);
    }
  }, [
    getCurrentSecond,
    hasStarted,
    isFinished,
    passage,
    raceStartedAt,
    recordPerformancePoint,
    roomState,
    sendFinish,
    sendProgress,
    typedText,
  ]);

  const dismissErrorModal = useCallback(() => {
    setShowErrorModal(false);
    setTrailingErrorCount(0);
    focusTypingArea();
  }, [focusTypingArea]);

  const restartLocalRace = useCallback(() => {
    resetLocalTyping();
    sendProgress(0, 0);
    focusTypingArea();
  }, [focusTypingArea, resetLocalTyping, sendProgress]);

  return {
    isConnected,
    connectionError,
    myConnId,
    hasJoined,
    roomState,
    players,
    passage,
    hostConnId,
    raceCount,
    countdown,
    typedText,
    elapsedSeconds,
    isRunning,
    isFinished,
    hasStarted,
    performanceHistory,
    errorEvents,
    caretStyle,
    wpmHistory,
    showErrorModal,
    trailingErrorCount,
    metrics,
    resultMetrics,
    chartData,
    isHost,
    myPlayer,
    join,
    startRace,
    handleTypingChange,
    dismissErrorModal,
    resetLocalTyping,
    textareaRef,
    textSurfaceRef,
    characterRefs,
    getCharacterState,
    focusTypingArea,
    isTypingFocused,
    handleFocusChange: setIsTypingFocused,
    handleRestart: restartLocalRace,
    raceStartedAt,
  };
}
