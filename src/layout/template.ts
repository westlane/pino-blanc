import { spec } from "./layout.data.js";
import { formatEmojiColumn } from "./event-columns.js";
import { padEndDisplay, padStartDisplay } from "./pad.js";
import type { LogLayoutField, LogSpan, LogLevelName } from "../types.js";

export { CLASSIC_LOG_LAYOUT, DEFAULT_LOG_LAYOUT } from "./presets.js";

const FIELD_RE = /%([a-z]+)(?::(left|right))?%/g;

export type LayoutRowContext = {
  level: LogLevelName;
  module: string;
  message: string;
  /** Fills `%emoji%` when present; blank column when omitted. */
  emoji?: string;
};

type LayoutPart =
  | { kind: "literal"; text: string }
  | { kind: "field"; field: LogLayoutField; align: "left" | "right" };

/** `%event%` is an alias for `%message%` (same column width and padding). */
function resolveLayoutField(token: string): LogLayoutField {
  if (token === "event") {
    return "message";
  }
  if (token === "level" || token === "module" || token === "message" || token === "emoji") {
    return token;
  }
  throw new Error(`Unknown log layout field %${token}%`);
}

export function parseLogLayout(template: string): LayoutPart[] {
  const parts: LayoutPart[] = [];
  let cursor = 0;
  for (const match of template.matchAll(FIELD_RE)) {
    const index = match.index ?? 0;
    if (index > cursor) {
      parts.push({ kind: "literal", text: template.slice(cursor, index) });
    }
    const field = resolveLayoutField(match[1]);
    parts.push({
      kind: "field",
      field,
      align: match[2] === "right" ? "right" : "left",
    });
    cursor = index + match[0].length;
  }
  if (cursor < template.length) {
    parts.push({ kind: "literal", text: template.slice(cursor) });
  }
  return parts;
}

function padMessageColumn(parts: LayoutPart[]): boolean {
  const fields = parts.filter((p): p is Extract<LayoutPart, { kind: "field" }> => p.kind === "field");
  const messageAt = fields.findIndex((f) => f.field === "message");
  const moduleAt = fields.findIndex((f) => f.field === "module");
  return messageAt >= 0 && moduleAt > messageAt;
}

function fieldSpan(
  field: LogLayoutField,
  align: "left" | "right",
  ctx: LayoutRowContext,
  padMessage: boolean,
): LogSpan {
  switch (field) {
    case "level": {
      const text = padEndDisplay(ctx.level.toUpperCase(), spec.levelWidth);
      return { text, role: "level" };
    }
    case "module": {
      const mod = `[${ctx.module}]`;
      const text =
        align === "right"
          ? padStartDisplay(mod, spec.moduleWidth)
          : padEndDisplay(mod, spec.moduleWidth);
      return { text, role: "module", tintKey: ctx.module };
    }
    case "message": {
      const width = padMessage ? spec.messageWidth : 0;
      const text = width > 0 ? padEndDisplay(ctx.message, width) : ctx.message;
      return { text, role: "message" };
    }
    case "emoji": {
      return {
        text: formatEmojiColumn(ctx.emoji),
        role: "emoji",
      };
    }
    default: {
      const never: never = field;
      throw new Error(`Unhandled layout field: ${never}`);
    }
  }
}

export function formatLayoutSpans(
  template: string,
  ctx: LayoutRowContext,
): LogSpan[] {
  const parts = parseLogLayout(template);
  const padMessage = padMessageColumn(parts);
  const spans: LogSpan[] = [];
  for (const part of parts) {
    if (part.kind === "literal") {
      if (part.text) {
        spans.push({ text: part.text, role: "message" });
      }
      continue;
    }
    spans.push(fieldSpan(part.field, part.align, ctx, padMessage));
  }
  return spans;
}
