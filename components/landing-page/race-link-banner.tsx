"use client";

import { IconCopy } from "@tabler/icons-react";

type RaceLinkBannerProps = {
  raceLink: string;
  copied: boolean;
  onCopy: () => void;
};

export function RaceLinkBanner({
  raceLink,
  copied,
  onCopy,
}: RaceLinkBannerProps) {
  if (!raceLink) {
    return null;
  }

  return (
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
          onClick={onCopy}
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl bg-primary px-4 text-sm font-medium text-primary-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <IconCopy className="size-4" />
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
    </div>
  );
}
