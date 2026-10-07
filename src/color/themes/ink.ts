import type { LogTheme } from "../../types.js";

export const ink: LogTheme = {
  id: "ink",
  background: "dark",
  levels: {
    trace: "#666666",
    debug: "#888888",
    info: "#cccccc",
    warn: "#ffaa00",
    error: "#ff4444",
    fatal: "#ff0000",
  },
  tintRamp: [
    "#aaaaaa",
    "#bbbbbb",
    "#cccccc",
    "#dddddd",
    "#888888",
    "#999999",
    "#777777",
    "#666666",
  ],
  roles: {
    module: "#999999",
    message: "#eeeeee",
    meta: "#888888",
    box: "#555555",
    accent: "#ffffff",
  },
};
