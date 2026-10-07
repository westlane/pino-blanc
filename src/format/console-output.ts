import type { ConsoleLeadingNewline, CreateLoggerOptions } from "../types.js";

export const CONSOLE_TRIPLE_COLOR_RESET = "\x1b[49m\x1b[39m\x1b[0m";

/** Leading newline unless `record[metaKey] === true` (e.g. `_noLeadingNewline`). */
export function consoleLeadingNewlineUnless(
  record: Record<string, unknown>,
  metaKey: string,
): boolean {
  return record[metaKey] !== true;
}

export function shouldLeadWithNewline(
  record: Record<string, unknown>,
  setting?: ConsoleLeadingNewline,
): boolean {
  if (setting === undefined || setting === false) {
    return false;
  }
  if (setting === true) {
    return true;
  }
  return setting(record);
}

export function applyConsoleOutputHygiene(
  line: string,
  record: Record<string, unknown>,
  options: CreateLoggerOptions,
): string {
  let out = line;
  if (shouldLeadWithNewline(record, options.consoleLeadingNewline)) {
    out = `\n${out}`;
  }
  if (options.consoleColorReset === "triple") {
    out = `${out}${CONSOLE_TRIPLE_COLOR_RESET}`;
  }
  return out;
}
