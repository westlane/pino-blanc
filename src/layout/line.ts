import { jsonMetaSpans } from "../format/json-meta.js";
import {
  BLANC_CONTROL_META_KEYS,
  stripPinoBindings,
} from "../record.js";
import type { LogSpan, LogLevelName, PinoLogRecord } from "../types.js";
import { expandPadBrackets } from "./pad-brackets.js";
import { templateHasMeta } from "./field-token.js";
import { EVENT_IDENTITY_META_KEYS } from "./identity-meta.js";
import { resolveLayoutTemplate } from "./presets.js";
import { formatLayoutSpans } from "./template.js";

function splitTextLayout(template: string): { row1: string; row2?: string } {
  const lines = template.split("\n");
  if (lines.length > 2) {
    throw new Error("Text layout supports at most two lines (one newline).");
  }
  const row1 = lines[0] ?? "";
  const row2Raw = lines[1];
  const row2 =
    row2Raw !== undefined && /[%[]/.test(row2Raw) ? row2Raw : undefined;
  return { row1, row2 };
}

/** Remove `%mt%` / `%meta%` (and their `[…]` cells) so text field parsing never sees them. */
export function stripMetaTokens(row: string): string {
  return row
    .replace(/\[[^\]]*%(?:mt|meta)(?::[^%\]]*)?%?[^\]]*\]/g, "")
    .replace(/%(?:mt|meta)(?::[^%]*)?%/g, "")
    .replace(/[ \t]+$/g, "");
}

function resolveMetaPayload(
  record: Record<string, unknown>,
): { metaText?: string; payload?: Record<string, unknown> } {
  const metaText =
    typeof record._metaText === "string" && record._metaText.length > 0
      ? record._metaText
      : undefined;
  const payload = stripPinoBindings(record, [
    ...BLANC_CONTROL_META_KEYS,
    ...EVENT_IDENTITY_META_KEYS,
  ]);
  const hasPayload = Boolean(payload && Object.keys(payload).length > 0);
  if (!metaText && !hasPayload) {
    return {};
  }
  return {
    ...(metaText ? { metaText } : {}),
    ...(hasPayload && payload ? { payload } : {}),
  };
}

function appendMetaSpans(
  spans: LogSpan[],
  meta: { metaText?: string; payload?: Record<string, unknown> },
): void {
  if (meta.metaText) {
    spans.push({ text: meta.metaText, role: "message" });
    return;
  }
  if (meta.payload) {
    spans.push(...jsonMetaSpans(meta.payload));
  }
}

/**
 * Standard text line. `%mt%` / `%meta%` may sit on row 1 (inline) or row 2
 * (stacked under pads). Meta is never passed through {@link formatLayoutSpans}.
 */
export function formatStandardSpans(
  level: LogLevelName,
  module: string,
  message: string,
  layout?: string,
  emoji?: string,
  record?: Record<string, unknown>,
): LogSpan[] {
  const template = resolveLayoutTemplate(layout);
  const { row1, row2 } = splitTextLayout(template);
  const inlineMeta = templateHasMeta(row1);
  const stackedMeta = Boolean(row2 && templateHasMeta(row2));
  const spans = formatLayoutSpans(stripMetaTokens(row1), {
    level,
    module,
    message,
    emoji,
    record: record as PinoLogRecord | undefined,
  });

  if (!record || (!inlineMeta && !stackedMeta)) {
    return spans;
  }

  const meta = resolveMetaPayload(record);
  if (!meta.metaText && !meta.payload) {
    return spans;
  }

  if (stackedMeta && row2) {
    const pad = expandPadBrackets(row2).replace(/%(?:meta|mt)(?::[^%]*)?%/g, "");
    spans.push({ text: "\n", role: "message" });
    if (pad) {
      spans.push({ text: pad, role: "message" });
    }
    appendMetaSpans(spans, meta);
    return spans;
  }

  // Inline meta on row 1 — keep one space before the JSON / _metaText.
  spans.push({ text: " ", role: "message" });
  appendMetaSpans(spans, meta);
  return spans;
}

export function spansToPlain(spans: LogSpan[]): string {
  return spans.map((s) => s.text).join("");
}
