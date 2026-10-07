import type { LogTheme } from "../src/types.js";

export const solarizedLight: LogTheme = {
  id: "solarized-light",
  background: "light",
  levels: {
    trace: "#93a1a1",
    debug: "#657b83",
    info: "#268bd2",
    warn: "#b58900",
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
    module: "#586e75",
    message: "#073642",
    meta: "#657b83",
    box: "#93a1a1",
    accent: "#2aa198",
  },
};
