import { jsonMetaSpans } from "../format/json-meta.js";
import {
  BLANC_CONTROL_META_KEYS,
  stripPinoBindings,
} from "../record.js";
import type { LogSpan, LogLevelName } from "../types.js";
import { expandPadBrackets } from "./pad-brackets.js";
import { templateHasMeta } from "./field-token.js";
import { EVENT_IDENTITY_META_KEYS } from "./identity-meta.js";
import { resolveLayoutTemplate } from "./presets.js";
import { formatLayoutSpans } from "./template.js";
import type { PinoLogRecord } from "../types.js";

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

/**
 * Standard text line. When the layout template has a second row with `%mt%` / `%meta%`
 * and `record` has user fields (or `_metaText`), appends meta under the pads.
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
  const spans = formatLayoutSpans(row1, {
    level,
    module,
    message,
    emoji,
    record: record as PinoLogRecord | undefined,
  });

  if (!row2 || !record) {
    return spans;
  }
  if (!templateHasMeta(row2)) {
    return spans;
  }

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
    return spans;
  }

  const pad = expandPadBrackets(row2).replace(/%(?:meta|mt)(?::[^%]*)?%/g, "");
  spans.push({ text: "\n", role: "message" });
  if (pad) {
    spans.push({ text: pad, role: "message" });
  }
  if (metaText) {
    spans.push({ text: metaText, role: "message" });
  } else if (payload) {
    spans.push(...jsonMetaSpans(payload));
  }
  return spans;
}

export function spansToPlain(spans: LogSpan[]): string {
  return spans.map((s) => s.text).join("");
}
