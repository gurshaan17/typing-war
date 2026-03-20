"use client";

import { IconFlag3, IconRefresh, IconSwords } from "@tabler/icons-react";

type HeaderProps = {
  onNextQuote: () => void;
  onCreateRace: () => void;
};

export function LandingHeader({
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
          <p className="text-2xl tracking-[0.26em] text-muted-foreground uppercase">
            typing wars
          </p>
          {/* <p className="text-xl font-semibold tracking-[-0.04em] text-foreground">
            Typing Wars
          </p> */}
        </div>
      </div>

      <div className="flex w-fit flex-wrap items-center gap-2 self-start rounded-3xl border border-border bg-[var(--site-panel-muted)] px-3 py-3 backdrop-blur-xl sm:self-auto">
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
