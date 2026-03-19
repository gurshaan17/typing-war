import type { Metadata } from "next";
import Script from "next/script";

import { ThemeProvider } from "@/components/theme-provider";
import { defaultKeyboardTheme, siteThemes } from "@/lib/site-theme";
import "./globals.css";

export const metadata: Metadata = {
  title: "Typing Wars",
  description: "Practice typing solo or create shareable race links for competitive multiplayer sprints.",
};

const THEME_STORAGE_KEY = "typing-wars-theme";
const THEME_READY_DELAY_MS = 500;

function getThemeInitializationScript() {
  const themeDefinitions = Object.fromEntries(
    Object.entries(siteThemes).map(([themeName, definition]) => [themeName, definition.site]),
  );

  return `
    (function() {
      var storageKey = ${JSON.stringify(THEME_STORAGE_KEY)};
      var defaultTheme = ${JSON.stringify(defaultKeyboardTheme)};
      var themes = ${JSON.stringify(themeDefinitions)};
      var root = document.documentElement;
      var storedTheme = null;
      root.dataset.themeReady = "false";

      try {
        storedTheme = window.localStorage.getItem(storageKey);
      } catch (error) {}

      var themeName = storedTheme && themes[storedTheme] ? storedTheme : defaultTheme;
      var theme = themes[themeName];

      if (!theme) return;

      root.dataset.theme = themeName;
      root.style.setProperty("--background", theme.background);
      root.style.setProperty("--foreground", theme.foreground);
      root.style.setProperty("--card", theme.panel);
      root.style.setProperty("--card-foreground", theme.foreground);
      root.style.setProperty("--popover", theme.panelStrong);
      root.style.setProperty("--popover-foreground", theme.foreground);
      root.style.setProperty("--primary", theme.primary);
      root.style.setProperty("--primary-foreground", theme.primaryForeground);
      root.style.setProperty("--secondary", theme.secondary);
      root.style.setProperty("--secondary-foreground", theme.secondaryForeground);
      root.style.setProperty("--muted", theme.muted);
      root.style.setProperty("--muted-foreground", theme.mutedForeground);
      root.style.setProperty("--accent", theme.accent);
      root.style.setProperty("--accent-foreground", theme.accentForeground);
      root.style.setProperty("--border", theme.border);
      root.style.setProperty("--input", theme.border);
      root.style.setProperty("--ring", theme.ring);
      root.style.setProperty("--site-panel", theme.panel);
      root.style.setProperty("--site-panel-strong", theme.panelStrong);
      root.style.setProperty("--site-panel-muted", theme.panelMuted);
      root.style.setProperty("--site-glow", theme.glow);
      root.style.setProperty("--site-hero-from", theme.heroFrom);
      root.style.setProperty("--site-hero-via", theme.heroVia);
      root.style.setProperty("--site-hero-to", theme.heroTo);
      root.style.setProperty("--site-grid", theme.grid);

      window.setTimeout(function() {
        root.dataset.themeReady = "true";
      }, ${THEME_READY_DELAY_MS});
    })();
  `;
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning data-theme-ready="false">
      <body className="antialiased">
        <Script
          id="theme-init"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{ __html: getThemeInitializationScript() }}
        />
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
