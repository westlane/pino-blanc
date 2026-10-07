import { formatEmojiColumn } from "./event-columns.js";
import {
  LAYOUT_FIELD_RE,
  parseFieldModifiers,
  resolveLayoutField,
  type FieldAlign,
} from "./field-token.js";
import { GRID_DEFAULTS } from "./grid-defaults.js";
import { padEndDisplay, padStartDisplay } from "./pad.js";
import type { LogLayoutField, LogSpan, LogLevelName } from "../types.js";

export { CLASSIC_LOG_LAYOUT, DEFAULT_LOG_LAYOUT } from "./presets.js";

export type LayoutRowContext = {
  level: LogLevelName;
  module: string;
  message: string;
  emoji?: string;
};

type LayoutPart =
  | { kind: "literal"; text: string }
  | {
      kind: "field";
      field: LogLayoutField;
      align: FieldAlign;
      width?: number;
    };

export function parseLogLayout(template: string): LayoutPart[] {
  const parts: LayoutPart[] = [];
  let cursor = 0;
  for (const match of template.matchAll(LAYOUT_FIELD_RE)) {
    const index = match.index ?? 0;
    if (index > cursor) {
      parts.push({ kind: "literal", text: template.slice(cursor, index) });
    }
    const field = resolveLayoutField(match[1]);
    const mods = parseFieldModifiers(match[1], match[2]);
    parts.push({
      kind: "field",
      field,
      align: field === "module" ? mods.align : mods.align === "auto" ? "left" : mods.align,
      width: mods.width,
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

function columnWidth(field: LogLayoutField, part: Extract<LayoutPart, { kind: "field" }>): number {
  if (part.width !== undefined) {
    return part.width;
  }
  switch (field) {
    case "level":
      return GRID_DEFAULTS.level;
    case "module":
      return GRID_DEFAULTS.module;
    case "message":
      return GRID_DEFAULTS.message;
    case "emoji":
      return GRID_DEFAULTS.emoji;
    default: {
      const never: never = field;
      throw new Error(`Unhandled layout field: ${never}`);
    }
  }
}

export function resolveModuleAlign(
  parts: LayoutPart[],
  part: Extract<LayoutPart, { kind: "field" }>,
): "left" | "right" {
  if (part.align === "right" || part.align === "left") {
    return part.align;
  }
  const fields = parts.filter(
    (p): p is Extract<LayoutPart, { kind: "field" }> => p.kind === "field",
  );
  const last = fields[fields.length - 1];
  return last?.field === "module" ? "right" : "left";
}

function fieldSpan(
  part: Extract<LayoutPart, { kind: "field" }>,
  ctx: LayoutRowContext,
  padMessage: boolean,
  parts: LayoutPart[],
): LogSpan {
  switch (part.field) {
    case "level": {
      const text = padEndDisplay(ctx.level.toUpperCase(), columnWidth("level", part));
      return { text, role: "level" };
    }
    case "module": {
      const mod = `[${ctx.module}]`;
      const resolved =
        part.align === "auto" ? resolveModuleAlign(parts, part) : part.align;
      const w = columnWidth("module", part);
      const text =
        resolved === "right" ? padStartDisplay(mod, w) : padEndDisplay(mod, w);
      return { text, role: "module", tintKey: ctx.module };
    }
    case "message": {
      const width = padMessage ? columnWidth("message", part) : 0;
      const text = width > 0 ? padEndDisplay(ctx.message, width) : ctx.message;
      return { text, role: "message" };
    }
    case "emoji": {
      return {
        text: formatEmojiColumn(ctx.emoji, columnWidth("emoji", part)),
        role: "emoji",
      };
    }
    default: {
      const never: never = part.field;
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
    spans.push(fieldSpan(part, ctx, padMessage, parts));
  }
  return spans;
}
