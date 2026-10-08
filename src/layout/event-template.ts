import { jsonMetaSpans } from "../format/json-meta.js";
import { PB_CONTROL_META_KEYS, stripPinoBindings } from "../record.js";
import type { LogSpan, PinoLogRecord, SymbolMap } from "../types.js";
import { expandPadBrackets } from "./pad-brackets.js";
import { resolveEmojiFromMeta } from "./event-columns.js";
import {
  LAYOUT_FIELD_RE,
  canonicalizeFieldToken,
  parseFieldModifiers,
  templateHasIdentity,
  templateHasMeta,
} from "./field-token.js";
import { EVENT_IDENTITY_META_KEYS, identityColumnSpan } from "./identity-meta.js";
import { formatLayoutSpans, type LayoutRowContext } from "./template.js";

type EventLayoutPart =
  | { kind: "literal"; text: string }
  | { kind: "identity"; width?: number | undefined }
  | { kind: "meta" }
  | { kind: "field"; token: string };

function parseEventLayoutRow(template: string): EventLayoutPart[] {
  const expanded = expandPadBrackets(template);
  const parts: EventLayoutPart[] = [];
  let cursor = 0;
  for (const match of expanded.matchAll(LAYOUT_FIELD_RE)) {
    const index = match.index ?? 0;
    if (index > cursor) {
      parts.push({ kind: "literal", text: expanded.slice(cursor, index) });
    }
    const rawField = match[1] ?? "";
    const name = canonicalizeFieldToken(rawField);
    const mods = parseFieldModifiers(rawField, match[2]);
    if (name === "identity") {
      parts.push({ kind: "identity", width: mods.width });
    } else if (name === "meta") {
      parts.push({ kind: "meta" });
    } else {
      const fieldName = name === "event" ? "message" : name;
      const segs: string[] = [fieldName];
      if (mods.minWidth !== undefined && mods.width !== undefined) {
        segs.push(`${mods.minWidth}-${mods.width}`);
      } else if (mods.width !== undefined) {
        segs.push(String(mods.width));
      }
      if (mods.align === "left" || mods.align === "right" || mods.align === "center") {
        segs.push(mods.align);
      }
      parts.push({ kind: "field", token: segs.join(":") });
    }
    cursor = index + match[0].length;
  }
  if (cursor < expanded.length) {
    parts.push({ kind: "literal", text: expanded.slice(cursor) });
  }
  return parts;
}

export function splitEventLayoutTemplate(template: string): {
  row1: string;
  row2?: string | undefined;
} {
  const lines = template.split("\n");
  if (lines.length > 2) {
    throw new Error("Event layout supports at most two lines (one newline).");
  }
  const row1 = lines[0] ?? "";
  const row2Raw = lines[1];
  const row2 =
    row2Raw !== undefined && /[%[]/.test(row2Raw) ? row2Raw : undefined;
  return { row1, row2 };
}

export function eventLayoutUsesIdentity(template: string): boolean {
  return templateHasIdentity(template);
}

function eventPayload(record: PinoLogRecord): Record<string, unknown> | undefined {
  const payload = stripPinoBindings(record, [
    ...PB_CONTROL_META_KEYS,
    ...EVENT_IDENTITY_META_KEYS,
  ]);
  // Event payloads use `name` as display data; pino also uses `name` as a binding.
  const displayName = record.name;
  if (
    payload &&
    typeof displayName === "string" &&
    displayName.length > 0 &&
    !("name" in payload)
  ) {
    return { ...payload, name: displayName };
  }
  return payload;
}

function layoutContext(
  record: PinoLogRecord,
  row: 1 | 2,
  module: string,
): LayoutRowContext {
  // Leave width/pad to the template (`%ev:N%` / pad-brackets). Pre-padding here
  // forced a blank column before meta even when the layout asked for natural width.
  const message = row === 1 ? String(record.msg ?? "") : "";
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
      // `%mt%` may sit on row 1 (inline, event.default) or row 2 (stacked).
      const metaText = record._metaText;
      if (typeof metaText === "string" && metaText.length > 0) {
        spans.push({ text: metaText, role: "message" });
        continue;
      }
      if (payload && Object.keys(payload).length > 0) {
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
  ctx: {
    module: string;
    symbolMap?: SymbolMap | undefined;
    identityWidth?: number | undefined;
  },
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
  const stackedMeta = Boolean(row2 && templateHasMeta(row2));
  if (!stackedMeta || !row2) {
    return spans;
  }
  const payload = eventPayload(record);
  const metaText =
    typeof record._metaText === "string" && record._metaText.length > 0
      ? record._metaText
      : undefined;
  if (metaText || (payload && Object.keys(payload).length > 0)) {
    spans.push({ text: "\n", role: "message" });
    spans.push(
      ...formatEventRow(row2, record, 2, ctx.module, ctx.symbolMap, ctx.identityWidth),
    );
  }
  return spans;
}
