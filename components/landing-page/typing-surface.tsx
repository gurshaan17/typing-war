"use client";

import type { MutableRefObject, RefObject } from "react";
import { IconRefresh } from "@tabler/icons-react";

import { cn } from "@/lib/utils";
import type { CaretStyle, CharacterState, TestMetrics } from "@/components/landing-page/types";

type TypingSurfaceProps = {
  duration: number;
  secondsLeft: number;
  metrics: TestMetrics;
  snippet: string;
  typedText: string;
  caretStyle: CaretStyle;
  isTypingFocused: boolean;
  isLocked: boolean;
  textareaRef: RefObject<HTMLTextAreaElement | null>;
  textSurfaceRef: RefObject<HTMLDivElement | null>;
  characterRefs: MutableRefObject<Array<HTMLSpanElement | null>>;
  getCharacterState: (index: number) => CharacterState;
  onTypingChange: (value: string) => void;
  onFocusChange: (isFocused: boolean) => void;
  onFocusTypingArea: () => void;
  onRestart: () => void;
};

export function TypingSurface({
  duration,
  secondsLeft,
  metrics,
  snippet,
  typedText,
  caretStyle,
  isTypingFocused,
  isLocked,
  textareaRef,
  textSurfaceRef,
  characterRefs,
  getCharacterState,
  onTypingChange,
  onFocusChange,
  onFocusTypingArea,
  onRestart,
}: TypingSurfaceProps) {
  return (
    <>
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
        onClick={onFocusTypingArea}
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            event.preventDefault();
            onFocusTypingArea();
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
          onChange={(event) => onTypingChange(event.target.value)}
          onFocus={() => onFocusChange(true)}
          onBlur={() => onFocusChange(false)}
          className="absolute inset-0 h-full w-full resize-none opacity-0"
          spellCheck={false}
          autoCapitalize="off"
          autoCorrect="off"
          disabled={isLocked}
          readOnly={isLocked}
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
          onClick={onRestart}
          className="inline-flex min-h-10 items-center gap-2 rounded-2xl px-3 transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <IconRefresh className="size-4" />
          restart test
        </button>
      </div>
    </>
  );
}
