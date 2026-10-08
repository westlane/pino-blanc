/** Nord palette — Sven Greb. See themes/README.md */
import type { LogTheme } from "../src/types.js";

export const nord: LogTheme = {
  id: "nord",
  background: "dark",
  levels: {
    trace: "#4c566a",
    debug: "#81a1c1",
    info: "#ebcb8b",
    warn: "#d08770",
    error: "#bf616a",
    fatal: "#b48ead",
  },
  tintRamp: [
    "#88c0d0",
    "#8fbcbb",
    "#81a1c1",
    "#a3be8c",
    "#ebcb8b",
    "#d08770",
    "#bf616a",
    "#b48ead",
  ],
  roles: {
    module: "#81a1c1",
    message: "#eceff4",
    meta: "#4c566a",
    box: "#3b4252",
    accent: "#88c0d0",
  },
};
