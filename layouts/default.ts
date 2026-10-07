import type { LogLayoutPreset } from "./types.js";

/** Level, padded message body, right-aligned `[module]` tag. */
export const defaultLayout: LogLayoutPreset = {
  id: "default",
  description: "Level, padded message, module tag in the final column",
  template: "%level% %emoji%  %message% %module:right%",
};
