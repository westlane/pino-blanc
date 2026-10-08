import { formatEmojiColumn, formatFixedWidthColumn } from "./event-columns.js";
import { expandPadBrackets } from "./pad-brackets.js";
import {
  LAYOUT_FIELD_RE,
  parseFieldModifiers,
  resolveLayoutField,
  type FieldAlign,
} from "./field-token.js";
import { GRID_DEFAULTS } from "./grid-defaults.js";
import { identityColumnSpan } from "./identity-meta.js";
import { padCenterDisplay, padEndDisplay, padStartDisplay } from "./pad.js";
import { displayWidth } from "./width.js";
import type { LogLayoutField, LogSpan, LogLevelName, PinoLogRecord } from "../types.js";

export type LayoutRowContext = {
  level: LogLevelName;
  module: string;
  message: string;
  emoji?: string | undefined;
  /** When set, `%id%` / `%identity%` resolve via identity column helpers. */
  record?: PinoLogRecord | undefined;
  identityWidth?: number | undefined;
};

type LayoutPart =
  | { kind: "literal"; text: string }
  | {
      kind: "field";
      field: LogLayoutField;
      align: FieldAlign;
      width?: number | undefined;
      minWidth?: number | undefined;
    };

export function parseLogLayout(template: string): LayoutPart[] {
  const expanded = expandPadBrackets(template);
  const parts: LayoutPart[] = [];
  let cursor = 0;
  for (const match of expanded.matchAll(LAYOUT_FIELD_RE)) {
    const index = match.index ?? 0;
    if (index > cursor) {
      parts.push({ kind: "literal", text: expanded.slice(cursor, index) });
    }
    const rawField = match[1] ?? "";
    const field = resolveLayoutField(rawField);
    const mods = parseFieldModifiers(rawField, match[2]);
    parts.push({
      kind: "field",
      field,
      align: field === "module" ? mods.align : mods.align === "auto" ? "left" : mods.align,
      width: mods.width,
      minWidth: mods.minWidth,
    });
    cursor = index + match[0].length;
  }
  if (cursor < expanded.length) {
    parts.push({ kind: "literal", text: expanded.slice(cursor) });
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
    case "identity":
      return GRID_DEFAULTS.identity;
    default: {
      const never: never = field;
      throw new Error(`Unhandled layout field: ${never}`);
    }
  }
}

function applyAlign(text: string, width: number, align: "left" | "right" | "center"): string {
  switch (align) {
    case "right":
      return padStartDisplay(text, width);
    case "center":
      return padCenterDisplay(text, width);
    case "left":
      return padEndDisplay(text, width);
    default: {
      const never: never = align;
      throw new Error(`Unhandled align: ${never}`);
    }
  }
}

/** Truncate to max width, honor min width, then align into a fixed column. */
function formatCell(
  text: string,
  width: number,
  align: "left" | "right" | "center",
  minWidth?: number,
): string {
  let cell = text;
  if (displayWidth(cell) > width) {
    cell = formatFixedWidthColumn(cell, width);
  }
  if (minWidth !== undefined && displayWidth(cell) < minWidth) {
    cell = padEndDisplay(cell, Math.min(minWidth, width));
  }
  return applyAlign(cell, width, align);
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
      const w = columnWidth("level", part);
      const align = part.align === "center" || part.align === "right" ? part.align : "left";
      return {
        text: formatCell(ctx.level.toUpperCase(), w, align, part.minWidth),
        role: "level",
      };
    }
    case "module": {
      const w = columnWidth("module", part);
      const align =
        part.align === "center"
          ? "center"
          : part.align === "auto"
            ? resolveModuleAlign(parts, part)
            : part.align;
      // Pad the name *inside* `[…]` so both brackets sit on the column edges.
      const innerW = Math.max(1, w - 2);
      const name = formatCell(ctx.module, innerW, align, part.minWidth);
      return {
        text: `[${name}]`,
        role: "module",
        tintKey: ctx.module,
      };
    }
    case "message": {
      const width = padMessage || part.width !== undefined ? columnWidth("message", part) : 0;
      if (width <= 0) {
        return { text: ctx.message, role: "message" };
      }
      const align =
        part.align === "right" || part.align === "center" ? part.align : "left";
      return {
        text: formatCell(ctx.message, width, align, part.minWidth),
        role: "message",
      };
    }
    case "emoji": {
      return {
        text: formatEmojiColumn(ctx.emoji, columnWidth("emoji", part)),
        role: "emoji",
      };
    }
    case "identity": {
      const width = columnWidth("identity", part);
      const record = ctx.record ?? { level: 30 };
      return identityColumnSpan(record, 1, undefined, ctx.identityWidth ?? width);
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
