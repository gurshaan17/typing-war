"use client";

import { IconCheck, IconPalette, IconSearch, IconX } from "@tabler/icons-react";

import { cn } from "@/lib/utils";
import {
  keyboardThemeNames,
  siteThemes,
  type KeyboardThemeName,
} from "@/lib/site-theme";

type ThemePickerModalProps = {
  isOpen: boolean;
  theme: KeyboardThemeName;
  themeQuery: string;
  onThemeQueryChange: (value: string) => void;
  onClose: () => void;
  onSelectTheme: (theme: KeyboardThemeName) => void;
  onPreviewTheme: (theme: KeyboardThemeName) => void;
  onClearPreview: () => void;
};

export function ThemePickerModal({
  isOpen,
  theme,
  themeQuery,
  onThemeQueryChange,
  onClose,
  onSelectTheme,
  onPreviewTheme,
  onClearPreview,
}: ThemePickerModalProps) {
  if (!isOpen) {
    return null;
  }

  const filteredThemes = keyboardThemeNames.filter((themeName) => {
    const currentTheme = siteThemes[themeName];
    const query = themeQuery.trim().toLowerCase();

    if (!query) {
      return true;
    }

    return (
      currentTheme.label.toLowerCase().includes(query) ||
      currentTheme.description.toLowerCase().includes(query) ||
      themeName.toLowerCase().includes(query)
    );
  });

  return (
    <div
      className="fixed inset-0 z-30 flex items-end justify-center bg-black/38 p-3 backdrop-blur-[3px] sm:items-center sm:p-6"
      onClick={onClose}
    >
      <div
        className="w-full max-w-3xl overflow-hidden rounded-[2rem] border border-black/10 bg-[#f4f2ee] text-[#4e5358] shadow-[0_28px_90px_rgba(0,0,0,0.28)]"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center gap-3 border-b border-black/6 px-5 py-4 sm:px-8 sm:py-5">
          <IconSearch className="size-6 shrink-0 text-[#5c5e61]" />
          <label htmlFor="theme-search" className="sr-only">
            Search themes
          </label>
          <input
            id="theme-search"
            value={themeQuery}
            onChange={(event) => onThemeQueryChange(event.target.value)}
            placeholder="Theme..."
            autoFocus
            className="h-12 flex-1 bg-transparent text-2xl tracking-[-0.04em] text-[#4e5358] placeholder:text-[#6d7175] focus:outline-none"
          />
          <button
            type="button"
            onClick={onClose}
            className="inline-flex size-11 items-center justify-center rounded-2xl text-[#5c5e61] transition-colors hover:bg-black/5 hover:text-[#27292c] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4a4d50]/20"
          >
            <IconX className="size-5" />
          </button>
        </div>

        <div className="max-h-[70vh] overflow-y-auto px-2 py-4 sm:px-3">
          {filteredThemes.length === 0 ? (
            <div className="px-5 py-8 font-mono text-lg text-[#6d7175]">
              No themes found.
            </div>
          ) : (
            filteredThemes.map((themeName) => {
              const currentTheme = siteThemes[themeName];
              const isActive = themeName === theme;

              return (
                <button
                  key={themeName}
                  type="button"
                  onClick={() => {
                    onSelectTheme(themeName);
                    onClearPreview();
                    onClose();
                  }}
                  onMouseEnter={() => onPreviewTheme(themeName)}
                  onFocus={() => onPreviewTheme(themeName)}
                  onMouseLeave={onClearPreview}
                  className={cn(
                    "flex w-full items-center gap-4 rounded-2xl px-4 py-3 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4a4d50]/20 sm:px-5",
                    isActive ? "bg-[#1f1f1f] text-white" : "text-[#505357] hover:bg-black/4",
                  )}
                >
                  <span className="inline-flex w-8 shrink-0 items-center justify-center">
                    {isActive ? <IconCheck className="size-6" /> : null}
                  </span>
                  <span className="min-w-0 flex-1 text-[1.05rem] sm:text-[1.15rem]">
                    {currentTheme.label.toLowerCase()}
                  </span>
                  <span className="flex shrink-0 items-center gap-2 rounded-full bg-white/90 px-2 py-1">
                    <span
                      className="size-6 rounded-full"
                      style={{ backgroundColor: currentTheme.keyboard.accent.bg }}
                    />
                    <span
                      className="size-6 rounded-full"
                      style={{ backgroundColor: currentTheme.keyboard.dark.bg }}
                    />
                    <span
                      className="size-6 rounded-full"
                      style={{ backgroundColor: currentTheme.keyboard.light.bg }}
                    />
                  </span>
                </button>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

type ThemePickerFabProps = {
  themeLabel: string;
  onClick: () => void;
};

export function ThemePickerFab({ themeLabel, onClick }: ThemePickerFabProps) {
  return (
    <div className="pointer-events-none fixed bottom-6 right-6 z-20 flex justify-end">
      <button
        type="button"
        onClick={onClick}
        className="pointer-events-auto inline-flex min-h-12 items-center gap-3 rounded-full border border-border bg-[var(--site-panel-strong)] px-4 py-3 text-sm text-foreground shadow-[0_16px_40px_rgba(0,0,0,0.24)] backdrop-blur-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <IconPalette className="size-4 text-primary" />
        <span>{themeLabel}</span>
      </button>
    </div>
  );
}
