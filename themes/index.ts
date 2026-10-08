import { catppuccinLatte } from "./catppuccin-latte.js";
import { catppuccinMocha } from "./catppuccin-mocha.js";
import { dracula } from "./dracula.js";
import { gruvboxDark } from "./gruvbox-dark.js";
import { gruvboxLight } from "./gruvbox-light.js";
import { nord } from "./nord.js";
import { solarizedDark } from "./solarized-dark.js";
import { solarizedLight } from "./solarized-light.js";
import type { LogTheme } from "../src/types.js";

export {
  catppuccinLatte,
  catppuccinMocha,
  dracula,
  gruvboxDark,
  gruvboxLight,
  nord,
  solarizedDark,
  solarizedLight,
};

export const BUILT_IN_THEMES: Record<string, LogTheme> = {
  "solarized-dark": solarizedDark,
  "solarized-light": solarizedLight,
  "gruvbox-dark": gruvboxDark,
  "gruvbox-light": gruvboxLight,
  nord,
  dracula,
  "catppuccin-mocha": catppuccinMocha,
  "catppuccin-latte": catppuccinLatte,
};

export function builtInThemeIds(): string[] {
  return Object.keys(BUILT_IN_THEMES);
}
