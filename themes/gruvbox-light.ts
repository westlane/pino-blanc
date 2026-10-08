/** Gruvbox palette. Pavel Pertsev. See themes/README.md */
import type { LogTheme } from "../src/types.js";

export const gruvboxLight: LogTheme = {
  id: "gruvbox-light",
  background: "light",
  levels: {
    trace: "#928374",
    debug: "#7c6f64",
    info: "#458588",
    warn: "#d79921",
    error: "#cc241d",
    fatal: "#b16286",
  },
  tintRamp: [
    "#458588",
    "#689d6a",
    "#98971a",
    "#d79921",
    "#d65d0e",
    "#cc241d",
    "#b16286",
    "#3c3836",
  ],
  roles: {
    module: "#7c6f64",
    message: "#3c3836",
    meta: "#928374",
    box: "#bdae93",
    accent: "#689d6a",
  },
};
