/** Solarized palette — Ethan Schoonover. See themes/README.md */
import type { LogTheme } from "../src/types.js";

export const solarizedDark: LogTheme = {
  id: "solarized-dark",
  background: "dark",
  levels: {
    trace: "#93a1a1",
    debug: "#839496",
    info: "#b58900",
    warn: "#cb4b16",
    error: "#dc322f",
    fatal: "#d33682",
  },
  tintRamp: [
    "#268bd2",
    "#2aa198",
    "#859900",
    "#b58900",
    "#cb4b16",
    "#dc322f",
    "#6c71c4",
    "#d33682",
  ],
  roles: {
    module: "#93a1a1",
    message: "#eee8d5",
    meta: "#839496",
    box: "#586e75",
    accent: "#2aa198",
  },
};
