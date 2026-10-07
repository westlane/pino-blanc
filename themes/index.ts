import { gruvboxDark } from "./gruvbox-dark.js";
import { gruvboxLight } from "./gruvbox-light.js";
import { solarizedDark } from "./solarized-dark.js";
import { solarizedLight } from "./solarized-light.js";
import type { LogTheme } from "../src/types.js";

export { gruvboxDark, gruvboxLight, solarizedDark, solarizedLight };

export const BUILT_IN_THEMES: Record<string, LogTheme> = {
  "solarized-dark": solarizedDark,
  "solarized-light": solarizedLight,
  "gruvbox-dark": gruvboxDark,
  "gruvbox-light": gruvboxLight,
};

export function builtInThemeIds(): string[] {
  return Object.keys(BUILT_IN_THEMES);
}
