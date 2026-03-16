export const keyboardThemeNames = [
  "classic",
  "mint",
  "royal",
  "dolch",
  "sand",
  "scarlet",
] as const;

export type KeyboardThemeName = (typeof keyboardThemeNames)[number];

export type SiteThemeDefinition = {
  label: string;
  description: string;
  site: {
    background: string;
    foreground: string;
    panel: string;
    panelStrong: string;
    panelMuted: string;
    border: string;
    primary: string;
    primaryForeground: string;
    secondary: string;
    secondaryForeground: string;
    accent: string;
    accentForeground: string;
    muted: string;
    mutedForeground: string;
    ring: string;
    glow: string;
    heroFrom: string;
    heroVia: string;
    heroTo: string;
    grid: string;
  };
  keyboard: {
    accent: { bg: string; text: string };
    dark: { bg: string; text: string };
    light: { bg: string; text: string };
  };
};

export const siteThemes: Record<KeyboardThemeName, SiteThemeDefinition> = {
  classic: {
    label: "Classic Ember",
    description: "Dark graphite with a hot orange race line.",
    site: {
      background: "#0c0d10",
      foreground: "#f5f0e8",
      panel: "rgba(21, 23, 28, 0.82)",
      panelStrong: "rgba(31, 34, 41, 0.94)",
      panelMuted: "rgba(17, 19, 24, 0.68)",
      border: "rgba(255, 255, 255, 0.12)",
      primary: "#f57644",
      primaryForeground: "#180d09",
      secondary: "#242831",
      secondaryForeground: "#f5f0e8",
      accent: "#737373",
      accentForeground: "#f7f7f7",
      muted: "#191c23",
      mutedForeground: "rgba(245, 240, 232, 0.68)",
      ring: "rgba(245, 118, 68, 0.45)",
      glow: "rgba(245, 118, 68, 0.24)",
      heroFrom: "rgba(245, 118, 68, 0.24)",
      heroVia: "rgba(99, 102, 241, 0.12)",
      heroTo: "rgba(12, 13, 16, 0)",
      grid: "rgba(255, 255, 255, 0.06)",
    },
    keyboard: {
      accent: { bg: "#F57644", text: "rgba(0,0,0,0.5)" },
      dark: { bg: "#737373", text: "rgba(255,255,255,0.7)" },
      light: { bg: "#F5F5F5", text: "rgba(0,0,0,0.7)" },
    },
  },
  mint: {
    label: "Mint Circuit",
    description: "Cool aqua surfaces with clean racing contrast.",
    site: {
      background: "#081514",
      foreground: "#ecfff9",
      panel: "rgba(12, 35, 35, 0.82)",
      panelStrong: "rgba(18, 48, 47, 0.94)",
      panelMuted: "rgba(8, 26, 25, 0.72)",
      border: "rgba(134, 200, 172, 0.24)",
      primary: "#86c8ac",
      primaryForeground: "#08221f",
      secondary: "#173e40",
      secondaryForeground: "#ecfff9",
      accent: "#447b82",
      accentForeground: "#f1fffd",
      muted: "#102827",
      mutedForeground: "rgba(236, 255, 249, 0.72)",
      ring: "rgba(134, 200, 172, 0.45)",
      glow: "rgba(134, 200, 172, 0.22)",
      heroFrom: "rgba(134, 200, 172, 0.22)",
      heroVia: "rgba(68, 123, 130, 0.18)",
      heroTo: "rgba(8, 21, 20, 0)",
      grid: "rgba(134, 200, 172, 0.08)",
    },
    keyboard: {
      accent: { bg: "#86C8AC", text: "rgba(255,255,255,0.7)" },
      dark: { bg: "#447B82", text: "rgba(255,255,255,0.7)" },
      light: { bg: "#EEEEEE", text: "#447B82" },
    },
  },
  royal: {
    label: "Royal Sprint",
    description: "A deep blue arcade look with gold acceleration.",
    site: {
      background: "#0a1020",
      foreground: "#f7f8ff",
      panel: "rgba(17, 26, 48, 0.82)",
      panelStrong: "rgba(24, 35, 63, 0.94)",
      panelMuted: "rgba(10, 16, 32, 0.76)",
      border: "rgba(228, 212, 64, 0.22)",
      primary: "#e4d440",
      primaryForeground: "#201d08",
      secondary: "#324974",
      secondaryForeground: "#f7f8ff",
      accent: "#3a3b35",
      accentForeground: "#f7f8ff",
      muted: "#10192f",
      mutedForeground: "rgba(247, 248, 255, 0.72)",
      ring: "rgba(228, 212, 64, 0.42)",
      glow: "rgba(228, 212, 64, 0.18)",
      heroFrom: "rgba(228, 212, 64, 0.18)",
      heroVia: "rgba(50, 73, 116, 0.24)",
      heroTo: "rgba(10, 16, 32, 0)",
      grid: "rgba(228, 212, 64, 0.07)",
    },
    keyboard: {
      accent: { bg: "#E4D440", text: "rgba(0,0,0,0.7)" },
      dark: { bg: "#3A3B35", text: "rgba(255,255,255,0.7)" },
      light: { bg: "#324974", text: "rgba(255,255,255,0.7)" },
    },
  },
  dolch: {
    label: "Dolch Drift",
    description: "Muted indigo tones with sharp red highlights.",
    site: {
      background: "#11131d",
      foreground: "#f5f6fc",
      panel: "rgba(30, 33, 47, 0.84)",
      panelStrong: "rgba(39, 43, 60, 0.94)",
      panelMuted: "rgba(17, 19, 29, 0.78)",
      border: "rgba(215, 62, 66, 0.22)",
      primary: "#d73e42",
      primaryForeground: "#fff4f4",
      secondary: "#4f5e78",
      secondaryForeground: "#f5f6fc",
      accent: "#3e3b4c",
      accentForeground: "#f5f6fc",
      muted: "#181b29",
      mutedForeground: "rgba(245, 246, 252, 0.72)",
      ring: "rgba(215, 62, 66, 0.42)",
      glow: "rgba(215, 62, 66, 0.2)",
      heroFrom: "rgba(215, 62, 66, 0.2)",
      heroVia: "rgba(79, 94, 120, 0.22)",
      heroTo: "rgba(17, 19, 29, 0)",
      grid: "rgba(255, 255, 255, 0.06)",
    },
    keyboard: {
      accent: { bg: "#D73E42", text: "rgba(0,0,0,0.7)" },
      dark: { bg: "#3E3B4C", text: "rgba(255,255,255,0.7)" },
      light: { bg: "#4F5E78", text: "rgba(255,255,255,0.7)" },
    },
  },
  sand: {
    label: "Sandstorm",
    description: "Warm desert surfaces with crisp clay highlights.",
    site: {
      background: "#18120f",
      foreground: "#fff6ef",
      panel: "rgba(38, 27, 22, 0.82)",
      panelStrong: "rgba(53, 38, 31, 0.92)",
      panelMuted: "rgba(24, 18, 15, 0.72)",
      border: "rgba(201, 78, 65, 0.24)",
      primary: "#c94e41",
      primaryForeground: "#fff4f0",
      secondary: "#893d36",
      secondaryForeground: "#fff6ef",
      accent: "#efefef",
      accentForeground: "#291b15",
      muted: "#231a16",
      mutedForeground: "rgba(255, 246, 239, 0.7)",
      ring: "rgba(201, 78, 65, 0.45)",
      glow: "rgba(201, 78, 65, 0.2)",
      heroFrom: "rgba(201, 78, 65, 0.22)",
      heroVia: "rgba(239, 239, 239, 0.08)",
      heroTo: "rgba(24, 18, 15, 0)",
      grid: "rgba(255, 246, 239, 0.06)",
    },
    keyboard: {
      accent: { bg: "#C94E41", text: "rgba(255,255,255,0.7)" },
      dark: { bg: "#893D36", text: "rgba(255,255,255,0.7)" },
      light: { bg: "#EFEFEF", text: "rgba(0,0,0,0.7)" },
    },
  },
  scarlet: {
    label: "Scarlet Pulse",
    description: "Soft rose neutrals tuned for a bright competitive feel.",
    site: {
      background: "#1d1517",
      foreground: "#fff6f7",
      panel: "rgba(53, 36, 40, 0.82)",
      panelStrong: "rgba(72, 48, 53, 0.92)",
      panelMuted: "rgba(29, 21, 23, 0.74)",
      border: "rgba(213, 134, 138, 0.24)",
      primary: "#d5868a",
      primaryForeground: "#2a1114",
      secondary: "#8f4246",
      secondaryForeground: "#fff6f7",
      accent: "#e1e1e1",
      accentForeground: "#512326",
      muted: "#2a1c1f",
      mutedForeground: "rgba(255, 246, 247, 0.72)",
      ring: "rgba(213, 134, 138, 0.44)",
      glow: "rgba(213, 134, 138, 0.22)",
      heroFrom: "rgba(213, 134, 138, 0.22)",
      heroVia: "rgba(225, 225, 225, 0.08)",
      heroTo: "rgba(29, 21, 23, 0)",
      grid: "rgba(255, 246, 247, 0.06)",
    },
    keyboard: {
      accent: { bg: "#E1E1E1", text: "#8F4246" },
      dark: { bg: "#D5868A", text: "rgba(255,255,255,0.7)" },
      light: { bg: "#E4D7D7", text: "#8F4246" },
    },
  },
};

export const defaultKeyboardTheme: KeyboardThemeName = "classic";
