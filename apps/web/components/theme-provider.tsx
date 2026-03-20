"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";

import {
  defaultKeyboardTheme,
  keyboardThemeNames,
  siteThemes,
  type KeyboardThemeName,
} from "@/lib/site-theme";

const STORAGE_KEY = "typing-wars-theme";
const THEME_CHANGE_EVENT = "typing-wars-theme-change";

function readStoredTheme(): KeyboardThemeName {
  if (typeof window === "undefined") {
    return defaultKeyboardTheme;
  }

  const storedTheme = window.localStorage.getItem(STORAGE_KEY);
  if (
    storedTheme &&
    keyboardThemeNames.includes(storedTheme as KeyboardThemeName)
  ) {
    return storedTheme as KeyboardThemeName;
  }

  return defaultKeyboardTheme;
}

type ThemeContextValue = {
  theme: KeyboardThemeName;
  setTheme: (theme: KeyboardThemeName) => void;
  previewTheme: (theme: KeyboardThemeName) => void;
  clearPreviewTheme: () => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

function applyTheme(theme: KeyboardThemeName) {
  const root = document.documentElement;
  const definition = siteThemes[theme].site;

  root.dataset.theme = theme;
  root.style.setProperty("--background", definition.background);
  root.style.setProperty("--foreground", definition.foreground);
  root.style.setProperty("--card", definition.panel);
  root.style.setProperty("--card-foreground", definition.foreground);
  root.style.setProperty("--popover", definition.panelStrong);
  root.style.setProperty("--popover-foreground", definition.foreground);
  root.style.setProperty("--primary", definition.primary);
  root.style.setProperty("--primary-foreground", definition.primaryForeground);
  root.style.setProperty("--secondary", definition.secondary);
  root.style.setProperty("--secondary-foreground", definition.secondaryForeground);
  root.style.setProperty("--muted", definition.muted);
  root.style.setProperty("--muted-foreground", definition.mutedForeground);
  root.style.setProperty("--accent", definition.accent);
  root.style.setProperty("--accent-foreground", definition.accentForeground);
  root.style.setProperty("--border", definition.border);
  root.style.setProperty("--input", definition.border);
  root.style.setProperty("--ring", definition.ring);
  root.style.setProperty("--site-panel", definition.panel);
  root.style.setProperty("--site-panel-strong", definition.panelStrong);
  root.style.setProperty("--site-panel-muted", definition.panelMuted);
  root.style.setProperty("--site-glow", definition.glow);
  root.style.setProperty("--site-hero-from", definition.heroFrom);
  root.style.setProperty("--site-hero-via", definition.heroVia);
  root.style.setProperty("--site-hero-to", definition.heroTo);
  root.style.setProperty("--site-grid", definition.grid);
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [previewThemeState, setPreviewThemeState] = useState<KeyboardThemeName | null>(null);
  const theme = useSyncExternalStore(
    (callback) => {
      function handleStorage(event: StorageEvent) {
        if (event.key && event.key !== STORAGE_KEY) {
          return;
        }

        callback();
      }

      function handleThemeChange() {
        callback();
      }

      window.addEventListener("storage", handleStorage);
      window.addEventListener(THEME_CHANGE_EVENT, handleThemeChange);

      return () => {
        window.removeEventListener("storage", handleStorage);
        window.removeEventListener(THEME_CHANGE_EVENT, handleThemeChange);
      };
    },
    readStoredTheme,
    () => defaultKeyboardTheme,
  );

  useEffect(() => {
    applyTheme(previewThemeState ?? theme);
  }, [previewThemeState, theme]);

  const setTheme = (nextTheme: KeyboardThemeName) => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY, nextTheme);
      window.dispatchEvent(new Event(THEME_CHANGE_EVENT));
    }
  };

  const value = useMemo(
    () => ({
      theme,
      setTheme,
      previewTheme: setPreviewThemeState,
      clearPreviewTheme: () => setPreviewThemeState(null),
    }),
    [theme],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useSiteTheme() {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error("useSiteTheme must be used within ThemeProvider");
  }

  return context;
}
