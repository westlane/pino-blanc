/** Gruvbox palette — Pavel Pertsev. See themes/README.md */
import type { LogTheme } from "../src/types.js";

export const gruvboxDark: LogTheme = {
  id: "gruvbox-dark",
  background: "dark",
  levels: {
    trace: "#928374",
    debug: "#a89984",
    info: "#fabd2f",
    warn: "#fe8019",
    error: "#fb4934",
    fatal: "#d3869b",
  },
  tintRamp: [
    "#83a598",
    "#8ec07c",
    "#b8bb26",
    "#fabd2f",
    "#fe8019",
    "#fb4934",
    "#d3869b",
    "#ebdbb2",
  ],
  roles: {
    module: "#a89984",
    message: "#ebdbb2",
    meta: "#928374",
    box: "#3c3836",
    accent: "#8ec07c",
  },
};
