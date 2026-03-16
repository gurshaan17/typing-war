"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  IconBolt,
  IconCheck,
  IconClockHour4,
  IconCopy,
  IconFlag3,
  IconPalette,
  IconRefresh,
  IconSettings,
  IconSwords,
  IconX,
} from "@tabler/icons-react";

import { useSiteTheme } from "@/components/theme-provider";
import { keyboardThemeNames, siteThemes } from "@/lib/site-theme";
import { cn } from "@/lib/utils";

const TEST_SNIPPETS = [
  "Typing Wars turns warmup sessions into a focused duel where accuracy matters as much as raw speed across the final stretch.",
  "Create a racetrack, share the link with friends, and let the leaderboard decide who keeps control when the pressure starts building.",
  "Fast fingers look good for a second, but steady rhythm wins more races once every mistake starts costing real momentum.",
] as const;

const TEST_TIMES = [15, 30, 60, 120] as const;

function createRaceId() {
  return Math.random().toString(36).slice(2, 8);
}

export function LandingPage() {
  const { theme, setTheme } = useSiteTheme();
  const [snippetIndex, setSnippetIndex] = useState(0);
  const [typedText, setTypedText] = useState("");
  const [duration, setDuration] = useState<(typeof TEST_TIMES)[number]>(30);
  const [secondsLeft, setSecondsLeft] = useState(30);
  const [isRunning, setIsRunning] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [raceLink, setRaceLink] = useState("");
  const [copied, setCopied] = useState(false);
  const [isThemeModalOpen, setIsThemeModalOpen] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const snippet = TEST_SNIPPETS[snippetIndex];
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

  useEffect(() => {
    if (!isThemeModalOpen) {
      return;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsThemeModalOpen(false);
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isThemeModalOpen]);

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
    resetTest((snippetIndex + 1) % TEST_SNIPPETS.length, duration);
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

      <div className="relative mx-auto flex min-h-dvh w-full max-w-[1440px] flex-col px-5 pb-24 pt-6 sm:px-8 lg:px-12">
        <header className="flex items-start justify-between gap-6">
          <div className="flex max-w-4xl flex-1 flex-wrap items-center gap-2 rounded-3xl border border-border bg-[var(--site-panel-muted)] px-3 py-3 backdrop-blur-xl">
            <div className="inline-flex min-h-10 items-center gap-2 rounded-2xl px-3 text-sm text-muted-foreground">
              <IconSettings className="size-4 text-primary" />
              settings
            </div>

            <div className="h-7 w-px bg-border/80" />

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

            <button
              type="button"
              onClick={() => setIsThemeModalOpen(true)}
              className="inline-flex min-h-10 items-center gap-2 rounded-2xl px-3 text-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <IconPalette className="size-4" />
              themes
            </button>
          </div>

          <div className="flex shrink-0 items-center gap-3 rounded-3xl px-2 py-2">
            <div className="flex size-11 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-[0_0_24px_var(--site-glow)]">
              <IconSwords className="size-5" />
            </div>
            <div className="text-right">
              <p className="text-xs tracking-[0.26em] text-muted-foreground uppercase">
                typing wars
              </p>
              <p className="text-xl font-semibold tracking-[-0.04em] text-foreground">
                Typing Wars
              </p>
            </div>
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

        <section className="flex flex-1 items-center justify-center py-10">
          <div className="w-full max-w-6xl">
            <div className="mb-8 flex flex-wrap items-center justify-center gap-5 text-sm text-muted-foreground">
              <div className="rounded-full px-3 py-1.5">
                mode <span className="ml-2 text-foreground">time</span>
              </div>
              <div className="rounded-full px-3 py-1.5">
                time <span className="ml-2 text-foreground">{duration}s</span>
              </div>
              <div className="rounded-full px-3 py-1.5">
                wpm <span className="ml-2 text-foreground">{metrics.wpm}</span>
              </div>
              <div className="rounded-full px-3 py-1.5">
                acc <span className="ml-2 text-foreground">{metrics.accuracy}%</span>
              </div>
              <div className="rounded-full px-3 py-1.5">
                left <span className="ml-2 text-foreground">{secondsLeft}s</span>
              </div>
            </div>

            <div
              role="button"
              tabIndex={0}
              onClick={focusTypingArea}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  focusTypingArea();
                }
              }}
              className="relative cursor-text rounded-[2.5rem] border border-transparent px-2 py-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <label htmlFor="typing-input" className="sr-only">
                Type the text shown in the practice area
              </label>
              <textarea
                id="typing-input"
                ref={textareaRef}
                value={typedText}
                onChange={(event) => handleTypingChange(event.target.value)}
                className="absolute inset-0 h-full w-full resize-none opacity-0"
                spellCheck={false}
                autoCapitalize="off"
                autoCorrect="off"
              />

              <div className="mx-auto max-w-6xl text-center font-mono text-[clamp(2rem,4vw,5.15rem)] leading-[1.34] tracking-[-0.06em]">
                {snippet.split("").map((char, index) => {
                  const typedChar = typedText[index];
                  const isCurrent = index === typedText.length;

                  return (
                    <span
                      key={`${char}-${index}`}
                      className={cn(
                        "transition-colors duration-150",
                        typedChar === undefined && "text-foreground/26",
                        typedChar !== undefined &&
                          typedChar === char &&
                          "text-foreground/92",
                        typedChar !== undefined &&
                          typedChar !== char &&
                          "text-red-300/70",
                        isCurrent &&
                          "border-l-4 border-primary bg-primary/5 text-foreground/92",
                      )}
                    >
                      {char}
                    </span>
                  );
                })}
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
              <div className="inline-flex min-h-10 items-center gap-2 rounded-2xl px-3">
                <IconBolt className="size-4 text-primary" />
                {isFinished ? "finished" : hasStarted ? "in progress" : "ready"}
              </div>
            </div>
          </div>
        </section>

        <div className="pointer-events-none fixed bottom-6 right-6 z-20 flex justify-end">
          <button
            type="button"
            onClick={() => setIsThemeModalOpen(true)}
            className="pointer-events-auto inline-flex min-h-12 items-center gap-3 rounded-full border border-border bg-[var(--site-panel-strong)] px-4 py-3 text-sm text-foreground shadow-[0_16px_40px_rgba(0,0,0,0.24)] backdrop-blur-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <IconPalette className="size-4 text-primary" />
            <span>{siteThemes[theme].label}</span>
          </button>
        </div>
      </div>

      {isThemeModalOpen ? (
        <div className="fixed inset-0 z-30 flex items-end justify-center bg-black/55 p-4 backdrop-blur-sm sm:items-center">
          <div className="w-full max-w-4xl rounded-[2rem] border border-border bg-[var(--site-panel-strong)] p-5 shadow-[0_24px_80px_rgba(0,0,0,0.42)]">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <p className="text-xs tracking-[0.24em] text-primary uppercase">
                  Theme selector
                </p>
                <h2 className="mt-1 text-2xl font-semibold tracking-[-0.04em] text-foreground">
                  Choose a keyboard theme for the whole site.
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setIsThemeModalOpen(false)}
                className="inline-flex size-11 items-center justify-center rounded-2xl border border-border text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <IconX className="size-5" />
              </button>
            </div>

            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {keyboardThemeNames.map((themeName) => {
                const currentTheme = siteThemes[themeName];
                const isActive = themeName === theme;

                return (
                  <button
                    key={themeName}
                    type="button"
                    onClick={() => {
                      setTheme(themeName);
                      setIsThemeModalOpen(false);
                    }}
                    className={cn(
                      "rounded-3xl border p-4 text-left transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                      isActive
                        ? "border-primary bg-primary/8 shadow-[0_12px_30px_var(--site-glow)]"
                        : "border-border bg-[var(--site-panel-muted)] hover:border-primary/45",
                    )}
                  >
                    <div className="mb-4 flex items-start justify-between gap-3">
                      <div>
                        <p className="text-lg font-semibold text-foreground">
                          {currentTheme.label}
                        </p>
                        <p className="mt-1 text-sm leading-6 text-muted-foreground">
                          {currentTheme.description}
                        </p>
                      </div>
                      {isActive ? (
                        <span className="inline-flex size-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
                          <IconCheck className="size-4" />
                        </span>
                      ) : null}
                    </div>
                    <div className="flex gap-2">
                      <span
                        className="h-11 flex-1 rounded-2xl border border-white/10"
                        style={{ backgroundColor: currentTheme.keyboard.dark.bg }}
                      />
                      <span
                        className="h-11 flex-1 rounded-2xl border border-white/10"
                        style={{ backgroundColor: currentTheme.keyboard.light.bg }}
                      />
                      <span
                        className="h-11 flex-1 rounded-2xl border border-white/10"
                        style={{ backgroundColor: currentTheme.keyboard.accent.bg }}
                      />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      ) : null}
    </main>
  );
}
