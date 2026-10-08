/** Tokyo Night. enkia. See themes/README.md */
import type { LogTheme } from "../src/types.js";

export const tokyoNightDark: LogTheme = {
  id: "tokyo-night-dark",
  background: "dark",
  levels: {
    trace: "#565f89",
    debug: "#7aa2f7",
    info: "#e0af68",
    warn: "#ff9e64",
    error: "#f7768e",
    fatal: "#bb9af7",
  },
  tintRamp: [
    "#7dcfff",
    "#9ece6a",
    "#7aa2f7",
    "#e0af68",
    "#ff9e64",
    "#f7768e",
    "#bb9af7",
    "#c0caf5",
  ],
  roles: {
    module: "#7aa2f7",
    message: "#c0caf5",
    meta: "#565f89",
    box: "#24283b",
    accent: "#7dcfff",
  },
};
