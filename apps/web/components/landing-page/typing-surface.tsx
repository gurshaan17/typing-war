"use client";

import type { MutableRefObject, RefObject } from "react";
import { IconRefresh } from "@tabler/icons-react";

import { cn } from "@/lib/utils";
import type {
  CaretStyle,
  CharacterState,
  TestMetrics,
  TestMode,
} from "@/components/landing-page/types";

type TypingSurfaceProps = {
  mode: TestMode;
  timeLimit: number;
  wordLimit: number;
  elapsedSeconds: number;
  timePresets: readonly (15 | 30 | 45 | 60)[];
  wordPresets: readonly (10 | 25 | 50 | 100)[];
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
  onModeChange: (mode: TestMode) => void;
  onTimeLimitChange: (value: 15 | 30 | 45 | 60) => void;
  onWordLimitChange: (value: 10 | 25 | 50 | 100) => void;
  customTextDraft: string;
  customTextReady: boolean;
  onCustomTextDraftChange: (value: string) => void;
  onApplyCustomText: () => void;
  showModeControls?: boolean;
  showCustomComposer?: boolean;
};

export function TypingSurface({
  mode,
  timeLimit,
  wordLimit,
  elapsedSeconds,
  timePresets,
  wordPresets,
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
  onModeChange,
  onTimeLimitChange,
  onWordLimitChange,
  customTextDraft,
  customTextReady,
  onCustomTextDraftChange,
  onApplyCustomText,
  showModeControls = true,
  showCustomComposer = true,
}: TypingSurfaceProps) {
  return (
    <>
      <div className="mb-6 flex flex-wrap items-center justify-center gap-3 text-sm text-muted-foreground sm:mb-8">
        {showModeControls ? (
          <>
            <div className="inline-flex items-center gap-1 rounded-2xl border border-border/70 bg-[var(--site-panel-muted)] p-1 backdrop-blur-sm">
              {(["time", "words", "custom"] as const).map((modeOption) => (
                <button
                  key={modeOption}
                  type="button"
                  onClick={() => onModeChange(modeOption)}
                  className={cn(
                    "inline-flex min-h-10 items-center rounded-xl px-3 text-sm capitalize transition-all duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                    mode === modeOption
                      ? "bg-primary text-primary-foreground shadow-[0_10px_30px_var(--site-glow)]"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {modeOption}
                </button>
              ))}
            </div>

            <div
              className={cn(
                "inline-flex items-center gap-1 overflow-hidden rounded-2xl border border-border/70 bg-[var(--site-panel-muted)] p-1 backdrop-blur-sm transition-all duration-250 ease-out",
                mode === "custom"
                  ? "max-w-0 scale-95 opacity-0"
                  : "max-w-[24rem] scale-100 opacity-100",
              )}
              aria-hidden={mode === "custom"}
            >
              {(mode === "time" ? timePresets : wordPresets).map((value) => (
                <button
                  key={`${mode}-${value}`}
                  type="button"
                  onClick={() =>
                    mode === "time"
                      ? onTimeLimitChange(value as 15 | 30 | 45 | 60)
                      : onWordLimitChange(value as 10 | 25 | 50 | 100)
                  }
                  className={cn(
                    "inline-flex min-h-10 items-center rounded-xl px-3 text-sm transition-all duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                    (mode === "time" ? timeLimit === value : wordLimit === value)
                      ? "scale-[1.03] bg-primary text-primary-foreground shadow-[0_12px_28px_var(--site-glow)] ring-1 ring-white/12"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {value}
                </button>
              ))}
            </div>
          </>
        ) : null}

        <div className="rounded-full border border-border/70 bg-[var(--site-panel-muted)] px-3 py-1.5 backdrop-blur-sm">
          mode <span className="ml-2 text-foreground">{mode}</span>
        </div>
        <div className="rounded-full border border-border/70 bg-[var(--site-panel-muted)] px-3 py-1.5 backdrop-blur-sm">
          wpm <span className="ml-2 text-foreground">{metrics.wpm}</span>
        </div>
        <div className="rounded-full border border-border/70 bg-[var(--site-panel-muted)] px-3 py-1.5 backdrop-blur-sm">
          acc <span className="ml-2 text-foreground">{metrics.accuracy}%</span>
        </div>
        <div className="rounded-full border border-border/70 bg-[var(--site-panel-muted)] px-3 py-1.5 backdrop-blur-sm">
          {mode === "time" ? "left" : "elapsed"}
          <span className="ml-2 text-foreground">{elapsedSeconds}s</span>
        </div>
      </div>

      <div
        className={cn(
          "overflow-hidden transition-all duration-300 ease-out",
          mode === "custom" && showCustomComposer
            ? "mb-6 max-h-[20rem] translate-y-0 opacity-100 sm:mb-8"
            : "mb-0 max-h-0 -translate-y-2 opacity-0",
        )}
        aria-hidden={mode !== "custom" || !showCustomComposer}
      >
        <div className="rounded-[2rem] border border-border/70 bg-[var(--site-panel-muted)] p-4 backdrop-blur-xl">
          <div className="mb-3 flex items-center justify-between gap-3">
            <div>
              <p className="text-sm tracking-[0.16em] text-muted-foreground uppercase">
                custom text
              </p>
              <p className="text-sm text-muted-foreground">
                Paste or write the text you want to practice.
              </p>
            </div>
            <button
              type="button"
              onClick={onApplyCustomText}
              className="inline-flex min-h-10 items-center rounded-2xl bg-primary px-4 text-sm font-medium text-primary-foreground transition-transform duration-200 ease-out hover:scale-[1.02] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              apply text
            </button>
          </div>

          <textarea
            value={customTextDraft}
            onChange={(event) => onCustomTextDraftChange(event.target.value)}
            placeholder="Type or paste your custom text here..."
            className="min-h-32 w-full resize-y rounded-[1.5rem] border border-border/70 bg-black/10 px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            spellCheck={false}
          />

          <div className="mt-3 flex flex-wrap items-center gap-3 text-xs tracking-[0.14em] text-muted-foreground uppercase">
            <span className="rounded-full border border-border/60 px-3 py-1.5">
              {customTextDraft.trim().length} chars
            </span>
            <span className="rounded-full border border-border/60 px-3 py-1.5">
              {customTextReady ? "ready to type" : "apply text to start"}
            </span>
          </div>
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

        <div className="relative min-h-[8.5rem] px-1 sm:min-h-[10.5rem]">
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
            {snippet.length === 0 ? (
              <div className="flex min-h-[8.5rem] items-center justify-center text-center text-lg text-muted-foreground sm:min-h-[10.5rem]">
                {mode === "custom"
                  ? "Add your custom text above, then press apply text to begin."
                  : "No text loaded."}
              </div>
            ) : snippet.split("").map((char, index) => {
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
                      "bg-[#ffe1e1] text-[#7f1d1d] shadow-[inset_0_0_0_1px_rgba(127,29,29,0.12)] underline decoration-[#c24141]/85 decoration-[0.08em] underline-offset-[0.18em]",
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
