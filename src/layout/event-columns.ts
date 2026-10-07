import { spec } from "./layout.data.js";
import { displayWidth } from "./width.js";
import type { EventColumnSpec, LogSpan } from "../types.js";

const eventSpec = spec.event;

export function defaultEventColumnSpec(): EventColumnSpec {
  return {
    emojiWidth: eventSpec.emojiWidth,
    eventNameWidth: eventSpec.eventNameWidth,
    identityToContentGap: eventSpec.identityToContentGap,
    showEmoji: true,
  };
}

function resolveSpec(overrides?: EventColumnSpec): EventColumnSpec {
  const base = defaultEventColumnSpec();
  return { ...base, ...overrides };
}

/**
 * Pad or center-ellipsis plain text to an exact display width.
 */
export function formatFixedWidthColumn(text: string, max: number): string {
  const cur = displayWidth(text);
  if (cur <= max) {
    return cur < max ? text + " ".repeat(max - cur) : text;
  }
  const sep = "...";
  const sepW = displayWidth(sep);
  const inner = max - sepW;
  if (inner < 2) {
    return sep.slice(0, max);
  }
  const left = Math.ceil(inner / 2);
  const right = inner - left;
  let i = 0;
  let leftChars = "";
  let leftW = 0;
  while (i < text.length && leftW < left) {
    const cp = text.codePointAt(i) ?? text.charCodeAt(i);
    const step = cp > 0xffff ? 2 : 1;
    const w =
      cp >= 0x1f300 && cp <= 0x1f9ff || cp >= 0x1fa70 && cp <= 0x1faff
        ? 2
        : 1;
    if (leftW + w > left) {
      break;
    }
    leftChars += text.slice(i, i + step);
    leftW += w;
    i += step;
  }
  let rightChars = "";
  let rightW = 0;
  let j = text.length;
  while (j > i && rightW < right) {
    const cp = text.codePointAt(j - 1) ?? text.charCodeAt(j - 1);
    const step = cp > 0xffff ? 2 : 1;
    const start = j - step;
    const w =
      cp >= 0x1f300 && cp <= 0x1f9ff || cp >= 0x1fa70 && cp <= 0x1faff
        ? 2
        : 1;
    if (rightW + w > right) {
      break;
    }
    rightChars = text.slice(start, j) + rightChars;
    rightW += w;
    j = start;
  }
  return leftChars + sep + rightChars;
}

/** Event name column — truncates long names; does not pad short names. */
export function formatEventNameColumn(
  name: string,
  width = eventSpec.eventNameWidth,
): string {
  if (!name) {
    return name;
  }
  const w = displayWidth(name);
  if (w <= width) {
    return name;
  }
  return formatFixedWidthColumn(name, width);
}

/** Pad short event names to column width (pretty alignment). */
export function padEventNameColumn(
  name: string,
  width = eventSpec.eventNameWidth,
): string {
  const formatted = formatEventNameColumn(name, width);
  const eventWidth = displayWidth(formatted);
  if (eventWidth < width) {
    return formatted + " ".repeat(width - eventWidth);
  }
  return formatted;
}

/**
 * Fixed-width emoji slot: leading space + emoji + pad + trailing space.
 * Empty emoji → blank column of `width` spaces.
 */
export function formatEmojiColumn(
  emoji: string | undefined,
  width = eventSpec.emojiWidth,
): string {
  const trimmed = emoji?.trim();
  if (!trimmed) {
    return " ".repeat(width);
  }
  const emojiW = displayWidth(trimmed);
  const pad = Math.max(0, 2 - emojiW);
  return ` ${trimmed}${" ".repeat(pad)} `;
}

export function emojiColumnSpan(
  emoji: string | undefined,
  overrides?: EventColumnSpec,
): LogSpan | null {
  const { emojiWidth, showEmoji } = resolveSpec(overrides);
  if (!showEmoji) {
    return null;
  }
  return {
    text: formatEmojiColumn(emoji, emojiWidth),
    role: "emoji",
  };
}

export function eventIdentityGapSpan(
  overrides?: EventColumnSpec,
): LogSpan {
  const { identityToContentGap } = resolveSpec(overrides);
  return { text: identityToContentGap ?? "  ", role: "message" };
}

export function eventNameSpan(
  eventName: string,
  overrides?: EventColumnSpec,
): LogSpan {
  const { eventNameWidth } = resolveSpec(overrides);
  return {
    text: padEventNameColumn(eventName, eventNameWidth),
    role: "message",
  };
}

/** Spans after identity chip on event row 1: [emoji?] gap eventName */
export function eventRowContentSpans(
  eventName: string,
  emoji?: string,
  overrides?: EventColumnSpec,
): LogSpan[] {
  const spans: LogSpan[] = [];
  const emojiSpan = emojiColumnSpan(emoji, overrides);
  if (emojiSpan) {
    spans.push(emojiSpan);
  }
  spans.push(eventIdentityGapSpan(overrides));
  spans.push(eventNameSpan(eventName, overrides));
  return spans;
}

/** Row-2 prefix after identity: blank emoji column + gap (no event name). */
export function eventRow2TailSpans(overrides?: EventColumnSpec): LogSpan[] {
  const { emojiWidth, showEmoji, identityToContentGap } = resolveSpec(overrides);
  const spans: LogSpan[] = [];
  if (showEmoji) {
    spans.push({
      text: " ".repeat(emojiWidth ?? eventSpec.emojiWidth),
      role: "emoji",
    });
  }
  spans.push({
    text: identityToContentGap ?? "  ",
    role: "message",
  });
  return spans;
}

export function resolveEmojiFromMeta(meta?: unknown): string | undefined {
  if (!meta || typeof meta !== "object") {
    return undefined;
  }
  const record = meta as Record<string, unknown>;
  if (typeof record._emoji === "string" && record._emoji.trim()) {
    return record._emoji.trim();
  }
  return undefined;
}
