"use client";

import { IconClockHour4, IconFlag3, IconRefresh, IconSwords } from "@tabler/icons-react";

import { cn } from "@/lib/utils";

type HeaderProps = {
  duration: number;
  testTimes: readonly (15 | 30 | 60 | 120)[];
  onDurationChange: (duration: 15 | 30 | 60 | 120) => void;
  onNextQuote: () => void;
  onCreateRace: () => void;
};

export function LandingHeader({
  duration,
  testTimes,
  onDurationChange,
  onNextQuote,
  onCreateRace,
}: HeaderProps) {
  return (
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

      <div className="flex w-fit flex-wrap items-center gap-2 self-start rounded-3xl border border-border bg-[var(--site-panel-muted)] px-3 py-3 backdrop-blur-xl sm:self-auto">
        <div className="inline-flex items-center gap-1 rounded-2xl bg-black/10 p-1">
          {testTimes.map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => onDurationChange(value)}
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
          onClick={onNextQuote}
          className="inline-flex min-h-10 items-center gap-2 rounded-2xl px-3 text-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <IconRefresh className="size-4" />
          new text
        </button>

        <button
          type="button"
          onClick={onCreateRace}
          className="inline-flex min-h-10 items-center gap-2 rounded-2xl px-3 text-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <IconFlag3 className="size-4" />
          create racetrack
        </button>
      </div>
    </header>
  );
}
