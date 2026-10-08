/** Catppuccin Mocha (dark). Catppuccin Org. See themes/README.md */
import type { LogTheme } from "../src/types.js";

export const catppuccinDark: LogTheme = {
  id: "catppuccin-dark",
  background: "dark",
  levels: {
    trace: "#6c7086",
    debug: "#89b4fa",
    info: "#f9e2af",
    warn: "#fab387",
    error: "#f38ba8",
    fatal: "#cba6f7",
  },
  tintRamp: [
    "#89b4fa",
    "#94e2d5",
    "#a6e3a1",
    "#f9e2af",
    "#fab387",
    "#f38ba8",
    "#cba6f7",
    "#f5c2e7",
  ],
  roles: {
    module: "#a6adc8",
    message: "#cdd6f4",
    meta: "#6c7086",
    box: "#313244",
    accent: "#94e2d5",
  },
};
