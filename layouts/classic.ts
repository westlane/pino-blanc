import type { LogLayoutPreset } from "./types.js";

/** Original column order: level, `[module]`, message. */
export const classicLayout: LogLayoutPreset = {
  id: "classic",
  description: "Level, module tag, then message (legacy)",
  template: "%level% %module% %message%",
};
