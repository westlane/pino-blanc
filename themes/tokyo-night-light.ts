/** Tokyo Night Light. enkia. See themes/README.md */
import type { LogTheme } from "../src/types.js";

export const tokyoNightLight: LogTheme = {
  id: "tokyo-night-light",
  background: "light",
  levels: {
    trace: "#6c6e75",
    debug: "#2959aa",
    info: "#8f5e15",
    warn: "#965027",
    error: "#8c4351",
    fatal: "#5a3e8e",
  },
  tintRamp: [
    "#0f4b6e",
    "#385f0d",
    "#2959aa",
    "#8f5e15",
    "#965027",
    "#8c4351",
    "#5a3e8e",
    "#343b58",
  ],
  roles: {
    module: "#2959aa",
    message: "#343b58",
    meta: "#6c6e75",
    box: "#d0d2db",
    accent: "#006c86",
  },
};
