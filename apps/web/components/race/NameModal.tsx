"use client";

import { useState } from "react";

type NameModalProps = {
  onJoin: (name: string) => void;
};

export function NameModal({ onJoin }: NameModalProps) {
  const [name, setName] = useState("");
  const trimmedName = name.trim();

  function submit() {
    if (!trimmedName) {
      return;
    }

    onJoin(trimmedName);
  }

  return (
    <div className="absolute inset-0 z-50 flex min-h-dvh items-center justify-center bg-black/50 px-4">
      <div className="w-full max-w-sm rounded-xl border border-border bg-background p-8 shadow-[0_24px_80px_rgba(0,0,0,0.28)]">
        <h2 className="text-2xl font-semibold tracking-[-0.04em] text-foreground">
          Enter your name
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Others will see this during the race
        </p>

        <input
          value={name}
          onChange={(event) => setName(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              submit();
            }
          }}
          placeholder="Your name"
          maxLength={20}
          autoFocus
          className="mt-6 h-12 w-full rounded-lg border border-border bg-background px-4 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        />

        <button
          type="button"
          onClick={submit}
          disabled={!trimmedName}
          className="mt-4 inline-flex min-h-11 w-full items-center justify-center rounded-lg bg-primary px-4 py-3 text-sm font-medium text-primary-foreground transition-opacity disabled:cursor-not-allowed disabled:opacity-50"
        >
          Join race →
        </button>
      </div>
    </div>
  );
}
