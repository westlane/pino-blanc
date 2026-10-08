import { catppuccinDark } from "./catppuccin-dark.js";
import { catppuccinLight } from "./catppuccin-light.js";
import { draculaDark } from "./dracula-dark.js";
import { draculaLight } from "./dracula-light.js";
import { gruvboxDark } from "./gruvbox-dark.js";
import { gruvboxLight } from "./gruvbox-light.js";
import { solarizedDark } from "./solarized-dark.js";
import { solarizedLight } from "./solarized-light.js";
import { tokyoNightDark } from "./tokyo-night-dark.js";
import { tokyoNightLight } from "./tokyo-night-light.js";
import type { LogTheme } from "../src/types.js";

export {
  catppuccinDark,
  catppuccinLight,
  draculaDark,
  draculaLight,
  gruvboxDark,
  gruvboxLight,
  solarizedDark,
  solarizedLight,
  tokyoNightDark,
  tokyoNightLight,
};

/** Canonical dark/light pairs. */
export const BUILT_IN_THEME_PAIRS = [
  ["solarized-dark", "solarized-light"],
  ["gruvbox-dark", "gruvbox-light"],
  ["tokyo-night-dark", "tokyo-night-light"],
  ["dracula-dark", "dracula-light"],
  ["catppuccin-dark", "catppuccin-light"],
] as const;

export const BUILT_IN_THEMES: Record<string, LogTheme> = {
  "solarized-dark": solarizedDark,
  "solarized-light": solarizedLight,
  "gruvbox-dark": gruvboxDark,
  "gruvbox-light": gruvboxLight,
  "tokyo-night-dark": tokyoNightDark,
  "tokyo-night-light": tokyoNightLight,
  "dracula-dark": draculaDark,
  "dracula-light": draculaLight,
  "catppuccin-dark": catppuccinDark,
  "catppuccin-light": catppuccinLight,
};

export function builtInThemeIds(): string[] {
  return BUILT_IN_THEME_PAIRS.flatMap(([dark, light]) => [dark, light]);
}
