import type { LogLevelName } from "../types.js";

const PINO_LEVELS: Record<LogLevelName, string> = {
  trace: "trace",
  debug: "debug",
  info: "info",
  warn: "warn",
  error: "error",
  fatal: "fatal",
};

export function toPinoLevel(level: string): string {
  const l = level.toLowerCase() as LogLevelName;
  return PINO_LEVELS[l] ?? "info";
}

export function levelFromPinoNumber(n: number): LogLevelName {
  if (n <= 10) return "trace";
  if (n <= 20) return "debug";
  if (n <= 30) return "info";
  if (n <= 40) return "warn";
  if (n <= 50) return "error";
  return "fatal";
}
