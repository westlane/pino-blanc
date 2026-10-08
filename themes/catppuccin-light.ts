/** Catppuccin Latte (light). Catppuccin Org. See themes/README.md */
import type { LogTheme } from "../src/types.js";

export const catppuccinLight: LogTheme = {
  id: "catppuccin-light",
  background: "light",
  levels: {
    trace: "#9ca0b0",
    debug: "#1e66f5",
    info: "#df8e1d",
    warn: "#fe640b",
    error: "#d20f39",
    fatal: "#8839ef",
  },
  tintRamp: [
    "#1e66f5",
    "#179299",
    "#40a02b",
    "#df8e1d",
    "#fe640b",
    "#d20f39",
    "#8839ef",
    "#ea76cb",
  ],
  roles: {
    module: "#6c6f85",
    message: "#4c4f69",
    meta: "#9ca0b0",
    box: "#ccd0da",
    accent: "#179299",
  },
};
