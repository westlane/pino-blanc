import type { LogLevelName } from "./types.js";

export function parseLevelName(level: string): LogLevelName {
  const l = level.toLowerCase();
  if (
    l === "trace" ||
    l === "debug" ||
    l === "info" ||
    l === "warn" ||
    l === "error" ||
    l === "fatal"
  ) {
    return l;
  }
  return "info";
}
