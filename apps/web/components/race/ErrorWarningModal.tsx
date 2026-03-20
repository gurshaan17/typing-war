"use client";

type ErrorWarningModalProps = {
  onDismiss: () => void;
};

export function ErrorWarningModal({ onDismiss }: ErrorWarningModalProps) {
  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="w-full max-w-sm rounded-xl border border-border bg-background p-8 text-center shadow-[0_24px_80px_rgba(0,0,0,0.28)]">
        <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-primary/12 text-primary">
          <svg
            viewBox="0 0 24 24"
            className="size-7"
            aria-hidden="true"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 3.5 21 19H3L12 3.5Z" />
            <path d="M12 9v5" />
            <path d="M12 17.25h.01" />
          </svg>
        </div>

        <h2 className="mt-5 text-2xl font-semibold tracking-[-0.04em] text-foreground">
          Fix your mistakes first
        </h2>
        <p className="mt-3 text-sm text-muted-foreground">
          You have incorrect characters in your typing. Backspace to correct them
          before you can finish the race.
        </p>

        <button
          type="button"
          onClick={onDismiss}
          className="mt-6 inline-flex min-h-11 w-full items-center justify-center rounded-lg bg-primary px-4 py-3 text-sm font-medium text-primary-foreground"
        >
          Got it, I&apos;ll fix it
        </button>
      </div>
    </div>
  );
}
