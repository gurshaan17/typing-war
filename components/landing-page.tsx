"use client";

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import {
  IconClockHour4,
  IconCopy,
  IconFlag3,
  IconRefresh,
  IconSwords,
} from "@tabler/icons-react";

import { cn } from "@/lib/utils";
import randomSentences from "@/random-sentences.json";

const TEST_TIMES = [15, 30, 60, 120] as const;

type CaretStyle = {
  left: number;
  top: number;
  height: number;
};

function createRaceId() {
  return Math.random().toString(36).slice(2, 8);
}

function getRandomSnippetIndex(currentIndex?: number) {
  if (randomSentences.length <= 1) {
    return 0;
  }

  let nextIndex = Math.floor(Math.random() * randomSentences.length);

  while (nextIndex === currentIndex) {
    nextIndex = Math.floor(Math.random() * randomSentences.length);
  }

  return nextIndex;
}

export function LandingPage() {
  const [snippetIndex, setSnippetIndex] = useState(17);
  const [typedText, setTypedText] = useState("");
  const [duration, setDuration] = useState<(typeof TEST_TIMES)[number]>(30);
  const [secondsLeft, setSecondsLeft] = useState(30);
  const [isRunning, setIsRunning] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [raceLink, setRaceLink] = useState("");
  const [copied, setCopied] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const textSurfaceRef = useRef<HTMLDivElement>(null);
  const characterRefs = useRef<Array<HTMLSpanElement | null>>([]);
  const [caretStyle, setCaretStyle] = useState<CaretStyle>({
    left: 0,
    top: 0,
    height: 0,
  });
  const [isTypingFocused, setIsTypingFocused] = useState(false);

  const snippet = randomSentences[snippetIndex] ?? "";
  const elapsedSeconds = hasStarted ? Math.max(duration - secondsLeft, 1) : 1;

  const metrics = useMemo(() => {
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

  const wordRanges = useMemo(() => {
    const ranges: Array<{ start: number; end: number }> = [];
    let wordStart = 0;

    for (let index = 0; index <= snippet.length; index += 1) {
      if (index === snippet.length || snippet[index] === " ") {
        ranges.push({ start: wordStart, end: index });
        wordStart = index + 1;
      }
    }

    return ranges;
  }, [snippet]);

  useEffect(() => {
    if (!isRunning) {
      return;
    }

    const timer = window.setInterval(() => {
      setSecondsLeft((current) => {
        if (current <= 1) {
          window.clearInterval(timer);
          setIsRunning(false);
          setIsFinished(true);
          return 0;
        }

        return current - 1;
      });
    }, 1000);

    return () => window.clearInterval(timer);
  }, [isRunning]);

  useEffect(() => {
    if (!copied) {
      return;
    }

    const timeout = window.setTimeout(() => setCopied(false), 1800);
    return () => window.clearTimeout(timeout);
  }, [copied]);

  function resetTest(nextSnippetIndex = snippetIndex, nextDuration = duration) {
    setTypedText("");
    setSecondsLeft(nextDuration);
    setIsRunning(false);
    setIsFinished(false);
    setHasStarted(false);
    setSnippetIndex(nextSnippetIndex);
  }

  function focusTypingArea() {
    window.requestAnimationFrame(() => textareaRef.current?.focus());
  }

  function getWordRange(index: number) {
    return wordRanges.find((range) => index >= range.start && index < range.end) ?? null;
  }

  function getCharacterState(index: number) {
    const typedChar = typedText[index];
    if (typedChar === undefined) {
      return "pending" as const;
    }

    const range = getWordRange(index);
    if (!range) {
      return typedChar === snippet[index] ? ("correct" as const) : ("incorrect" as const);
    }

    const typedWord = typedText.slice(range.start, Math.min(typedText.length, range.end));
    const targetWord = snippet.slice(range.start, range.end);
    const wordHasMistake = typedWord
      .split("")
      .some((char, offset) => char !== targetWord[offset]);
    const wordIsComplete =
      typedText.length > range.end ||
      (typedText.length === range.end && (typedText[index] !== undefined || isFinished));

    if (wordHasMistake && wordIsComplete) {
      return "wrong-word" as const;
    }

    return typedChar === snippet[index] ? ("correct" as const) : ("incorrect" as const);
  }

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

  function handleTypingChange(value: string) {
    if (!hasStarted && value.length > 0) {
      setHasStarted(true);
      setIsRunning(true);
      setIsFinished(false);
    }

    const nextValue = value.slice(0, snippet.length);
    if (nextValue.length >= snippet.length) {
      setIsRunning(false);
      setIsFinished(true);
    }
    setTypedText(nextValue);
  }

  function handleDurationChange(nextDuration: (typeof TEST_TIMES)[number]) {
    setDuration(nextDuration);
    resetTest(snippetIndex, nextDuration);
    focusTypingArea();
  }

  function handleNextQuote() {
    resetTest(getRandomSnippetIndex(snippetIndex), duration);
    focusTypingArea();
  }

  async function handleCreateRace() {
    const nextLink = `${window.location.origin}/race/${createRaceId()}`;
    setRaceLink(nextLink);

    try {
      await navigator.clipboard.writeText(nextLink);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  }

  async function handleCopyRaceLink() {
    if (!raceLink) {
      return;
    }

    try {
      await navigator.clipboard.writeText(raceLink);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  }

  return (
    <main className="relative min-h-dvh overflow-hidden bg-background text-foreground">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,var(--site-hero-from),transparent_28%),linear-gradient(180deg,transparent,rgba(0,0,0,0.18))]" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.25),transparent)]" />

      <div className="relative mx-auto flex min-h-dvh w-full max-w-[1440px] flex-col px-5 pb-24 pt-6 sm:px-8 lg:px-12">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex shrink-0 items-center gap-3 rounded-3xl px-1 py-1">
            <div className="flex size-11 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-[0_0_24px_var(--site-glow)]">
              <IconSwords className="size-5" />
            </div>
            <div>
              <p className="text-xs tracking-[0.26em] text-muted-foreground uppercase">
                typing wars
              </p>
              <p className="text-xl font-semibold tracking-[-0.04em] text-foreground">
                Typing Wars
              </p>
            </div>
          </div>

          <div className="flex max-w-4xl flex-1 flex-wrap items-center gap-2 rounded-3xl border border-border bg-[var(--site-panel-muted)] px-3 py-3 backdrop-blur-xl">
            <div className="inline-flex items-center gap-1 rounded-2xl bg-black/10 p-1">
              {TEST_TIMES.map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => handleDurationChange(value)}
                  className={cn(
                    "inline-flex min-h-10 items-center gap-2 rounded-xl px-3 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                    value === duration
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  <IconClockHour4 className="size-4" />
                  {value}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={handleNextQuote}
              className="inline-flex min-h-10 items-center gap-2 rounded-2xl px-3 text-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <IconRefresh className="size-4" />
              new text
            </button>

            <button
              type="button"
              onClick={handleCreateRace}
              className="inline-flex min-h-10 items-center gap-2 rounded-2xl px-3 text-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <IconFlag3 className="size-4" />
              create racetrack
            </button>
          </div>
        </header>

        {raceLink ? (
          <div className="mt-4 flex justify-center">
            <div className="flex w-full max-w-3xl flex-col gap-3 rounded-3xl border border-primary/25 bg-[var(--site-panel-muted)] px-4 py-4 text-sm backdrop-blur-xl sm:flex-row sm:items-center">
              <div className="flex-1 overflow-hidden">
                <p className="mb-1 text-xs tracking-[0.22em] text-primary uppercase">
                  Race link
                </p>
                <code className="block overflow-hidden text-ellipsis whitespace-nowrap text-foreground">
                  {raceLink}
                </code>
              </div>
              <button
                type="button"
                onClick={handleCopyRaceLink}
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl bg-primary px-4 text-sm font-medium text-primary-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <IconCopy className="size-4" />
                {copied ? "Copied" : "Copy"}
              </button>
            </div>
          </div>
        ) : null}

        <section className="flex flex-1 items-center justify-center py-8 sm:py-10">
          <div className="w-full max-w-6xl">
            <div className="mb-6 flex flex-wrap items-center justify-center gap-3 text-sm text-muted-foreground sm:mb-8">
              <div className="rounded-full border border-border/70 bg-[var(--site-panel-muted)] px-3 py-1.5 backdrop-blur-sm">
                mode <span className="ml-2 text-foreground">time</span>
              </div>
              <div className="rounded-full border border-border/70 bg-[var(--site-panel-muted)] px-3 py-1.5 backdrop-blur-sm">
                time <span className="ml-2 text-foreground">{duration}s</span>
              </div>
              <div className="rounded-full border border-border/70 bg-[var(--site-panel-muted)] px-3 py-1.5 backdrop-blur-sm">
                wpm <span className="ml-2 text-foreground">{metrics.wpm}</span>
              </div>
              <div className="rounded-full border border-border/70 bg-[var(--site-panel-muted)] px-3 py-1.5 backdrop-blur-sm">
                acc <span className="ml-2 text-foreground">{metrics.accuracy}%</span>
              </div>
              <div className="rounded-full border border-border/70 bg-[var(--site-panel-muted)] px-3 py-1.5 backdrop-blur-sm">
                left <span className="ml-2 text-foreground">{secondsLeft}s</span>
              </div>
            </div>

            <div
              onClick={focusTypingArea}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  focusTypingArea();
                }
              }}
              className="relative cursor-text rounded-[2.75rem] border border-border/70 bg-[linear-gradient(180deg,color-mix(in_srgb,var(--site-panel)_78%,transparent),color-mix(in_srgb,var(--site-panel-muted)_92%,transparent))] px-3 py-5 shadow-[0_24px_80px_rgba(0,0,0,0.2)] backdrop-blur-2xl transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:px-5 sm:py-6"
            >
              <label htmlFor="typing-input" className="sr-only">
                Type the text shown in the practice area
              </label>
              <textarea
                id="typing-input"
                ref={textareaRef}
                value={typedText}
                onChange={(event) => handleTypingChange(event.target.value)}
                onFocus={() => setIsTypingFocused(true)}
                onBlur={() => setIsTypingFocused(false)}
                className="absolute inset-0 h-full w-full resize-none opacity-0"
                spellCheck={false}
                autoCapitalize="off"
                autoCorrect="off"
              />

              <div className="relative min-h-[20rem] px-1 sm:min-h-[24rem]">
                <div
                  ref={textSurfaceRef}
                  className="relative w-full text-left font-mono text-[clamp(1.15rem,1.9vw,2.05rem)] leading-[1.68] tracking-[-0.03em] [font-variant-numeric:tabular-nums]"
                >
                  <span
                    aria-hidden="true"
                    className={cn(
                      "pointer-events-none absolute z-10 w-[3px] rounded-full bg-primary shadow-[0_0_16px_var(--site-glow)] will-change-transform transition-[transform,height,opacity] duration-110 ease-[cubic-bezier(0.22,1,0.36,1)]",
                      isTypingFocused ? "animate-[caret-pulse_1.1s_ease-in-out_infinite] opacity-100" : "opacity-0",
                    )}
                    style={{
                      height: `${caretStyle.height || 56}px`,
                      transform: `translate3d(${caretStyle.left}px, ${caretStyle.top}px, 0)`,
                    }}
                  />
                  {snippet.split("").map((char, index) => {
                    const characterState = getCharacterState(index);
                    const isActive = index === typedText.length;

                    return (
                      <span
                        key={`${char}-${index}`}
                        ref={(node) => {
                          characterRefs.current[index] = node;
                        }}
                        className={cn(
                          "relative rounded-[0.18em] transition-[color,background-color,box-shadow,opacity] duration-100 ease-out",
                          characterState === "pending" && "text-foreground/22",
                          characterState === "correct" && "text-foreground/94",
                          characterState === "incorrect" &&
                            "bg-red-500/12 text-red-200 underline decoration-red-300/85 decoration-[0.08em] underline-offset-[0.18em]",
                          characterState === "wrong-word" &&
                            "bg-red-500/18 text-red-100 underline decoration-red-300/95 decoration-[0.08em] underline-offset-[0.18em]",
                          isActive && "bg-white/6 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.04)]",
                        )}
                      >
                        {char}
                      </span>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="mt-10 flex flex-wrap items-center justify-center gap-4 text-sm text-muted-foreground">
              <button
                type="button"
                onClick={() => {
                  resetTest(snippetIndex, duration);
                  focusTypingArea();
                }}
                className="inline-flex min-h-10 items-center gap-2 rounded-2xl px-3 transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <IconRefresh className="size-4" />
                restart test
              </button>
              <button
                type="button"
                onClick={handleNextQuote}
                className="inline-flex min-h-10 items-center gap-2 rounded-2xl px-3 transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <IconRefresh className="size-4" />
                random text
              </button>
            </div>
          </div>
        </section>

      </div>
    </main>
  );
}
