import { jsonMetaSpans } from "../format/json-meta.js";
import { BLANC_CONTROL_META_KEYS, stripPinoBindings } from "../record.js";
import type { LogSpan, PinoLogRecord, SymbolMap } from "../types.js";
import { padEventNameColumn, resolveEmojiFromMeta } from "./event-columns.js";
import { LAYOUT_FIELD_RE, parseFieldModifiers } from "./field-token.js";
import { EVENT_IDENTITY_META_KEYS, identityColumnSpan } from "./identity-meta.js";
import { formatLayoutSpans, type LayoutRowContext } from "./template.js";

type EventLayoutPart =
  | { kind: "literal"; text: string }
  | { kind: "identity"; width?: number }
  | { kind: "meta" }
  | { kind: "field"; token: string };

function parseEventLayoutRow(template: string): EventLayoutPart[] {
  const parts: EventLayoutPart[] = [];
  let cursor = 0;
  for (const match of template.matchAll(LAYOUT_FIELD_RE)) {
    const index = match.index ?? 0;
    if (index > cursor) {
      parts.push({ kind: "literal", text: template.slice(cursor, index) });
    }
    const name = match[1];
    const clause = match[2];
    if (name === "identity") {
      parts.push({ kind: "identity", width: parseFieldModifiers(name, clause).width });
    } else if (name === "meta") {
      parts.push({ kind: "meta" });
    } else {
      const token = clause ? `${name}:${clause}` : name;
      parts.push({
        kind: "field",
        token: name === "event" ? token.replace(/^event/, "message") : token,
      });
    }
    cursor = index + match[0].length;
  }
  if (cursor < template.length) {
    parts.push({ kind: "literal", text: template.slice(cursor) });
  }
  return parts;
}

export function splitEventLayoutTemplate(template: string): {
  row1: string;
  row2?: string;
} {
  const lines = template.split("\n");
  if (lines.length > 2) {
    throw new Error("Event layout supports at most two lines (one newline).");
  }
  const row1 = lines[0] ?? "";
  const row2 = lines[1]?.trim() ? lines[1] : undefined;
  return { row1, row2 };
}

export function eventLayoutUsesIdentity(template: string): boolean {
  return /%identity/.test(template);
}

function eventPayload(record: PinoLogRecord): Record<string, unknown> | undefined {
  return stripPinoBindings(record, [
    ...BLANC_CONTROL_META_KEYS,
    ...EVENT_IDENTITY_META_KEYS,
  ]);
}

function layoutContext(
  record: PinoLogRecord,
  row: 1 | 2,
  module: string,
): LayoutRowContext {
  const message = row === 1 ? padEventNameColumn(String(record.msg ?? "")) : "";
  return {
    level: "info",
    module,
    message,
    emoji: row === 1 ? resolveEmojiFromMeta(record) : undefined,
  };
}

function formatEventRow(
  template: string,
  record: PinoLogRecord,
  row: 1 | 2,
  module: string,
  symbolMap?: SymbolMap,
  identityWidth?: number,
): LogSpan[] {
  const parts = parseEventLayoutRow(template);
  const ctx = layoutContext(record, row, module);
  const payload = eventPayload(record);
  const spans: LogSpan[] = [];

  for (const part of parts) {
    if (part.kind === "literal") {
      if (part.text) {
        spans.push({ text: part.text, role: "message" });
      }
      continue;
    }
    if (part.kind === "identity") {
      spans.push(
        identityColumnSpan(record, row, symbolMap, identityWidth ?? part.width),
      );
      continue;
    }
    if (part.kind === "meta") {
      if (row === 2 && payload && Object.keys(payload).length > 0) {
        spans.push(...jsonMetaSpans(payload));
      }
      continue;
    }
    spans.push(...formatLayoutSpans(`%${part.token}%`, ctx));
  }
  return spans;
}

export function formatEventLayoutSpans(
  template: string,
  record: PinoLogRecord,
  ctx: { module: string; symbolMap?: SymbolMap; identityWidth?: number },
): LogSpan[] {
  const { row1, row2 } = splitEventLayoutTemplate(template);
  const spans = formatEventRow(
    row1,
    record,
    1,
    ctx.module,
    ctx.symbolMap,
    ctx.identityWidth,
  );
  const payload = eventPayload(record);
  if (row2 && payload && Object.keys(payload).length > 0) {
    spans.push({ text: "\n", role: "message" });
    spans.push(
      ...formatEventRow(row2, record, 2, ctx.module, ctx.symbolMap, ctx.identityWidth),
    );
  }
  return spans;
}
