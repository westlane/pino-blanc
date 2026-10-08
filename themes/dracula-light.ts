/** Alucard (Dracula light) — Zeno Rocha & contributors. See themes/README.md */
import type { LogTheme } from "../src/types.js";

export const draculaLight: LogTheme = {
  id: "dracula-light",
  background: "light",
  levels: {
    trace: "#6c664b",
    debug: "#036a96",
    info: "#846e15",
    warn: "#a34d14",
    error: "#cb3a2a",
    fatal: "#a3144d",
  },
  tintRamp: [
    "#036a96",
    "#14710a",
    "#846e15",
    "#a34d14",
    "#cb3a2a",
    "#a3144d",
    "#644ac9",
    "#1f1f1f",
  ],
  roles: {
    module: "#6c664b",
    message: "#1f1f1f",
    meta: "#6c664b",
    box: "#cfcfde",
    accent: "#644ac9",
  },
};
