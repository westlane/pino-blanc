import { BLANC_LIVE_REPLACE_KEY } from "../record.js";

export { BLANC_LIVE_REPLACE_KEY };

export function isLiveReplaceRecord(
  record: Record<string, unknown> | undefined | null,
): boolean {
  return record?.[BLANC_LIVE_REPLACE_KEY] === true;
}

/** Visible terminal rows occupied by a pretty chunk (trailing newline counts). */
export function countTerminalLines(text: string): number {
  if (!text) {
    return 0;
  }
  let lines = 0;
  for (let i = 0; i < text.length; i += 1) {
    if (text.charCodeAt(i) === 10 /* \n */) {
      lines += 1;
    }
  }
  if (!text.endsWith("\n")) {
    lines += 1;
  }
  return lines;
}

/** CSI: move up `previousLines`, then erase to end of screen. */
export function liveReplacePrefix(previousLines: number): string {
  if (previousLines <= 0) {
    return "";
  }
  return `\x1b[${previousLines}A\x1b[0J`;
}

/**
 * Per-stream tracker so successive `_liveReplace` ticks overwrite one block;
 * a non-live write commits the last block into scrollback.
 */
export class LiveReplaceTracker {
  #previousLines = 0;

  prepare(formatted: string, live: boolean): string {
    if (!live) {
      this.#previousLines = 0;
      return formatted;
    }
    const prefix = liveReplacePrefix(this.#previousLines);
    this.#previousLines = countTerminalLines(formatted);
    return `${prefix}${formatted}`;
  }

  reset(): void {
    this.#previousLines = 0;
  }
}
