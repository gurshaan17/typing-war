"use client";

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";

import { LandingHeader } from "@/components/landing-page/header";
import {
  buildLinePath,
  CHART_HEIGHT,
  CHART_PADDING,
  CHART_WIDTH,
  clamp,
  createRaceId,
  getRandomSentence,
  getRandomWordsSnippet,
  TIME_MODE_PRESETS,
  WORD_MODE_PRESETS,
} from "@/components/landing-page/helpers";
import { RaceLinkBanner } from "@/components/landing-page/race-link-banner";
import { ResultsPanel } from "@/components/landing-page/results-panel";
import {
  ThemePickerFab,
  ThemePickerModal,
} from "@/components/landing-page/theme-picker-modal";
import { TypingSurface } from "@/components/landing-page/typing-surface";
import type {
  CaretStyle,
  ChartData,
  CharacterState,
  ErrorEvent,
  PerformancePoint,
  ResultMetrics,
  TestMode,
  TestMetrics,
} from "@/components/landing-page/types";
import { useSiteTheme } from "@/components/theme-provider";
import { siteThemes } from "@/lib/site-theme";
import randomSentences from "@/random-sentences.json";
import randomWords from "@/random-words.json";

function useTestMetrics(
  typedText: string,
  snippet: string,
  elapsedSeconds: number,
): TestMetrics {
  return useMemo(() => {
    const correctChars = typedText
      .split("")
      .filter((char, index) => char === snippet[index]).length;
    const accuracy = typedText.length
      ? Math.round((correctChars / typedText.length) * 100)
      : 100;
    const words = correctChars / 5;
    const wpm = Math.round(words / (elapsedSeconds / 60));

    return {
      accuracy,
      wpm: Number.isFinite(wpm) ? wpm : 0,
    };
  }, [elapsedSeconds, snippet, typedText]);
}

function useResultMetrics(
  typedText: string,
  snippet: string,
  elapsedSeconds: number,
  performanceHistory: PerformancePoint[],
  metrics: TestMetrics,
  errorCount: number,
): ResultMetrics {
  return useMemo(() => {
    const correctChars = typedText
      .split("")
      .filter((char, index) => char === snippet[index]).length;
    const incorrectChars = typedText.length - correctChars;
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
  }, [elapsedSeconds, errorCount, metrics.wpm, performanceHistory, snippet, typedText]);
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

export function LandingPage() {
  const { theme, setTheme, previewTheme, clearPreviewTheme } = useSiteTheme();

  const [mode, setMode] = useState<TestMode>("time");
  const [timeLimit, setTimeLimit] = useState<(typeof TIME_MODE_PRESETS)[number]>(30);
  const [wordLimit, setWordLimit] = useState<(typeof WORD_MODE_PRESETS)[number]>(25);
  const [snippet, setSnippet] = useState(() => getRandomSentence(randomSentences));
  const [typedText, setTypedText] = useState("");
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [raceLink, setRaceLink] = useState("");
  const [copied, setCopied] = useState(false);
  const [isTypingFocused, setIsTypingFocused] = useState(false);
  const [isThemeModalOpen, setIsThemeModalOpen] = useState(false);
  const [themeQuery, setThemeQuery] = useState("");
  const [performanceHistory, setPerformanceHistory] = useState<PerformancePoint[]>([]);
  const [errorEvents, setErrorEvents] = useState<ErrorEvent[]>([]);
  const [caretStyle, setCaretStyle] = useState<CaretStyle>({
    left: 0,
    top: 0,
    height: 0,
  });

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const textSurfaceRef = useRef<HTMLDivElement>(null);
  const characterRefs = useRef<Array<HTMLSpanElement | null>>([]);
  const typedTextRef = useRef(typedText);
  const elapsedSecondsRef = useRef(elapsedSeconds);
  const snippetRef = useRef("");
  const errorEventsRef = useRef<ErrorEvent[]>([]);
  const startTimeRef = useRef<number | null>(null);

  const elapsedForMetrics = hasStarted ? Math.max(elapsedSeconds, 1) : 1;
  const activeChartDuration = Math.max(
    mode === "time" ? timeLimit : elapsedSeconds,
    performanceHistory.at(-1)?.second ?? 1,
  );
  const displayTimeValue =
    mode === "time" ? Math.max(timeLimit - elapsedSeconds, 0) : Math.max(elapsedSeconds, 0);
  const selectedPresetLabel =
    mode === "time" ? `${timeLimit}s` : mode === "words" ? `${wordLimit}` : "free";
  const metrics = useTestMetrics(typedText, snippet, elapsedForMetrics);
  const resultMetrics = useResultMetrics(
    typedText,
    snippet,
    elapsedForMetrics,
    performanceHistory,
    metrics,
    errorEvents.length,
  );
  const chartData = useChartData(activeChartDuration, performanceHistory, errorEvents);

  useEffect(() => {
    typedTextRef.current = typedText;
  }, [typedText]);

  useEffect(() => {
    elapsedSecondsRef.current = elapsedSeconds;
  }, [elapsedSeconds]);

  useEffect(() => {
    snippetRef.current = snippet;
  }, [snippet]);

  useEffect(() => {
    errorEventsRef.current = errorEvents;
  }, [errorEvents]);

  useEffect(() => {
    if (!copied) {
      return;
    }

    const timeout = window.setTimeout(() => setCopied(false), 1800);
    return () => window.clearTimeout(timeout);
  }, [copied]);

  useEffect(() => {
    if (!isFinished) {
      return;
    }

    textareaRef.current?.blur();
  }, [isFinished]);

  useEffect(() => {
    if (!isThemeModalOpen) {
      clearPreviewTheme();
      return;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsThemeModalOpen(false);
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      clearPreviewTheme();
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [clearPreviewTheme, isThemeModalOpen]);

  const buildPerformancePoint = useCallback((second: number): PerformancePoint => {
    const currentText = typedTextRef.current;
    const currentSnippet = snippetRef.current;
    const correctChars = currentText
      .split("")
      .filter((char, index) => char === currentSnippet[index]).length;
    const accuracy = currentText.length
      ? Math.round((correctChars / currentText.length) * 100)
      : 100;
    const wpm = Math.round((correctChars / 5 / second) * 60);
    const rawWpm = Math.round((currentText.length / 5 / second) * 60);
    const errorCount = errorEventsRef.current.filter((event) => event.second <= second).length;

    return {
      second,
      wpm: Number.isFinite(wpm) ? wpm : 0,
      rawWpm: Number.isFinite(rawWpm) ? rawWpm : 0,
      accuracy,
      errorCount,
    };
  }, []);

  const recordPerformancePoint = useCallback((second: number) => {
    const maxDuration = mode === "time" ? timeLimit : Math.max(second, 1);
    const safeSecond = clamp(second, 1, maxDuration);

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
  }, [buildPerformancePoint, mode, timeLimit]);

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

      if (mode === "time" && nextElapsed >= timeLimit) {
        window.clearInterval(timer);
        setElapsedSeconds(timeLimit);
        setIsRunning(false);
        setIsFinished(true);
        setIsTypingFocused(false);
      }
    }, 1000);

    return () => window.clearInterval(timer);
  }, [isRunning, mode, recordPerformancePoint, timeLimit]);

  const resetTest = useCallback(
    (nextSnippet = snippet) => {
      setTypedText("");
      setElapsedSeconds(0);
      setIsRunning(false);
      setIsFinished(false);
      setHasStarted(false);
      setSnippet(nextSnippet);
      setPerformanceHistory([]);
      setErrorEvents([]);
      setIsTypingFocused(false);
      startTimeRef.current = null;
    },
    [snippet],
  );

  const focusTypingArea = useCallback(() => {
    window.requestAnimationFrame(() => textareaRef.current?.focus());
  }, []);

  const getCharacterState = useCallback(
    (index: number): CharacterState => {
      const typedChar = typedText[index];
      if (typedChar === undefined) {
        return "pending";
      }

      return typedChar === snippet[index] ? "correct" : "incorrect";
    },
    [snippet, typedText],
  );

  useLayoutEffect(() => {
    const container = textSurfaceRef.current;
    if (!container) {
      return;
    }

    const currentIndex = Math.min(typedText.length, snippet.length - 1);
    const currentCharacter = characterRefs.current[currentIndex];
    const previousCharacter =
      typedText.length > 0 ? characterRefs.current[typedText.length - 1] : null;

    const containerRect = container.getBoundingClientRect();
    const targetRect = (typedText.length >= snippet.length ? previousCharacter : currentCharacter)
      ?.getBoundingClientRect();

    if (!targetRect) {
      return;
    }

    const nextLeft =
      typedText.length >= snippet.length
        ? targetRect.right - containerRect.left
        : targetRect.left - containerRect.left;

    setCaretStyle({
      left: nextLeft,
      top: targetRect.top - containerRect.top,
      height: targetRect.height,
    });
  }, [snippet, typedText, isFinished]);

  useEffect(() => {
    function updateCaretOnResize() {
      const container = textSurfaceRef.current;
      if (!container) {
        return;
      }

      const currentIndex = Math.min(typedText.length, snippet.length - 1);
      const currentCharacter = characterRefs.current[currentIndex];
      const previousCharacter =
        typedText.length > 0 ? characterRefs.current[typedText.length - 1] : null;

      const containerRect = container.getBoundingClientRect();
      const targetRect = (typedText.length >= snippet.length ? previousCharacter : currentCharacter)
        ?.getBoundingClientRect();

      if (!targetRect) {
        return;
      }

      setCaretStyle({
        left:
          typedText.length >= snippet.length
            ? targetRect.right - containerRect.left
            : targetRect.left - containerRect.left,
        top: targetRect.top - containerRect.top,
        height: targetRect.height,
      });
    }

    window.addEventListener("resize", updateCaretOnResize);
    return () => window.removeEventListener("resize", updateCaretOnResize);
  }, [snippet, typedText]);

  const getCurrentSecond = useCallback(
    () => Math.max(elapsedSecondsRef.current, 1),
    [],
  );

  const handleTypingChange = useCallback(
    (value: string) => {
      if (isFinished) {
        return;
      }

      if (!hasStarted && value.length > 0) {
        startTimeRef.current = Date.now();
        setHasStarted(true);
        setIsRunning(true);
        setIsFinished(false);
      }

      const nextValue = value.slice(0, snippet.length);
      if (nextValue.length > typedText.length) {
        const currentSecond = getCurrentSecond();
        const nextErrors: ErrorEvent[] = [];

        for (let index = typedText.length; index < nextValue.length; index += 1) {
          if (nextValue[index] !== snippet[index]) {
            nextErrors.push({ second: currentSecond, index });
          }
        }

        if (nextErrors.length > 0) {
          setErrorEvents((currentEvents) => [...currentEvents, ...nextErrors]);
        }
      }

      if (mode !== "time" && nextValue.length >= snippet.length) {
        const finalElapsed = startTimeRef.current
          ? Math.max(1, Math.ceil((Date.now() - startTimeRef.current) / 1000))
          : 1;
        setElapsedSeconds(finalElapsed);
        recordPerformancePoint(finalElapsed);
        setIsRunning(false);
        setIsFinished(true);
        setIsTypingFocused(false);
      }

      setTypedText(nextValue);
    },
    [getCurrentSecond, hasStarted, isFinished, mode, recordPerformancePoint, snippet, typedText],
  );

  const handleNextQuote = useCallback(() => {
    const nextSnippet =
      mode === "words"
        ? getRandomWordsSnippet(randomWords, wordLimit)
        : getRandomSentence(randomSentences, snippet);
    resetTest(nextSnippet);
    focusTypingArea();
  }, [focusTypingArea, mode, resetTest, snippet, wordLimit]);

  const handleModeChange = useCallback(
    (nextMode: TestMode) => {
      setMode(nextMode);

      const nextSnippet =
        nextMode === "words"
          ? getRandomWordsSnippet(randomWords, wordLimit)
          : getRandomSentence(randomSentences, nextMode === "custom" ? undefined : snippet);

      resetTest(nextSnippet);
      focusTypingArea();
    },
    [focusTypingArea, resetTest, snippet, wordLimit],
  );

  const handleTimeLimitChange = useCallback(
    (nextTimeLimit: (typeof TIME_MODE_PRESETS)[number]) => {
      setTimeLimit(nextTimeLimit);
      if (mode === "time") {
        resetTest(getRandomSentence(randomSentences, snippet));
        focusTypingArea();
      }
    },
    [focusTypingArea, mode, resetTest, snippet],
  );

  const handleWordLimitChange = useCallback(
    (nextWordLimit: (typeof WORD_MODE_PRESETS)[number]) => {
      setWordLimit(nextWordLimit);
      if (mode === "words") {
        resetTest(getRandomWordsSnippet(randomWords, nextWordLimit));
        focusTypingArea();
      }
    },
    [focusTypingArea, mode, resetTest],
  );

  const handleCreateRace = useCallback(async () => {
    const nextLink = `${window.location.origin}/race/${createRaceId()}`;
    setRaceLink(nextLink);

    try {
      await navigator.clipboard.writeText(nextLink);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  }, []);

  const handleCopyRaceLink = useCallback(async () => {
    if (!raceLink) {
      return;
    }

    try {
      await navigator.clipboard.writeText(raceLink);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  }, [raceLink]);

  return (
    <main className="relative min-h-dvh overflow-hidden bg-background text-foreground">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,var(--site-hero-from),transparent_28%),linear-gradient(180deg,transparent,rgba(0,0,0,0.18))]" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.25),transparent)]" />

      <div className="relative mx-auto flex min-h-dvh w-full max-w-[1440px] flex-col px-5 pb-24 pt-6 sm:px-8 lg:px-12">
        <LandingHeader
          onNextQuote={handleNextQuote}
          onCreateRace={handleCreateRace}
        />

        <RaceLinkBanner
          raceLink={raceLink}
          copied={copied}
          onCopy={handleCopyRaceLink}
        />

        <section className="flex flex-1 items-center justify-center py-8 sm:py-10">
          <div className="w-full max-w-6xl">
            <TypingSurface
              mode={mode}
              timeLimit={timeLimit}
              wordLimit={wordLimit}
              elapsedSeconds={displayTimeValue}
              selectedPresetLabel={selectedPresetLabel}
              timePresets={TIME_MODE_PRESETS}
              wordPresets={WORD_MODE_PRESETS}
              metrics={metrics}
              snippet={snippet}
              typedText={typedText}
              caretStyle={caretStyle}
              isTypingFocused={isTypingFocused}
              isLocked={isFinished || (mode === "time" && displayTimeValue <= 0)}
              textareaRef={textareaRef}
              textSurfaceRef={textSurfaceRef}
              characterRefs={characterRefs}
              getCharacterState={getCharacterState}
              onTypingChange={handleTypingChange}
              onFocusChange={setIsTypingFocused}
              onFocusTypingArea={focusTypingArea}
              onRestart={() => {
                resetTest(snippet);
                focusTypingArea();
              }}
              onModeChange={handleModeChange}
              onTimeLimitChange={handleTimeLimitChange}
              onWordLimitChange={handleWordLimitChange}
            />

            <ResultsPanel
              isVisible={isFinished && performanceHistory.length > 0}
              duration={mode === "time" ? timeLimit : Math.max(elapsedSeconds, 1)}
              metrics={metrics}
              resultMetrics={resultMetrics}
              chartData={chartData}
            />
          </div>
        </section>
      </div>

      <ThemePickerFab
        themeLabel={siteThemes[theme].label}
        onClick={() => {
          setThemeQuery("");
          setIsThemeModalOpen(true);
        }}
      />

      <ThemePickerModal
        isOpen={isThemeModalOpen}
        theme={theme}
        themeQuery={themeQuery}
        onThemeQueryChange={setThemeQuery}
        onClose={() => setIsThemeModalOpen(false)}
        onSelectTheme={setTheme}
        onPreviewTheme={previewTheme}
        onClearPreview={clearPreviewTheme}
      />
    </main>
  );
}
