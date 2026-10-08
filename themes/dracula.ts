/** Dracula OSS palette — Zeno Rocha & contributors. See themes/README.md */
import type { LogTheme } from "../src/types.js";

export const dracula: LogTheme = {
  id: "dracula",
  background: "dark",
  levels: {
    trace: "#6272a4",
    debug: "#8be9fd",
    info: "#f1fa8c",
    warn: "#ffb86c",
    error: "#ff5555",
    fatal: "#ff79c6",
  },
  tintRamp: [
    "#8be9fd",
    "#50fa7b",
    "#f1fa8c",
    "#ffb86c",
    "#ff5555",
    "#ff79c6",
    "#bd93f9",
    "#f8f8f2",
  ],
  roles: {
    module: "#6272a4",
    message: "#f8f8f2",
    meta: "#6272a4",
    box: "#44475a",
    accent: "#bd93f9",
  },
};
