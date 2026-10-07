import { resolveLayoutTemplate } from "../../layouts/index.js";
import spec from "../../spec/const.json" with { type: "json" };
import type { LogSpan } from "../types.js";
import { formatLayoutSpans } from "./template.js";
import { displayWidth } from "./width.js";

/** Display column where the `[module]` span begins for a layout template. */
export function trailingModuleColumnStart(layout?: string): number {
  const spans = formatLayoutSpans(resolveLayoutTemplate(layout), {
    level: "info",
    module: "m",
    message: "",
    emoji: undefined,
  });
  const moduleAt = spans.findIndex((s) => s.role === "module");
  if (moduleAt < 0) {
    return 0;
  }
  return spansPlainWidth(spans.slice(0, moduleAt));
}

export function spansPlainWidth(spans: LogSpan[]): number {
  return displayWidth(spans.map((s) => s.text).join(""));
}

/** `LEVEL` + single gap after level from a standard layout row. */
export function standardRowLeadSpans(row: LogSpan[]): LogSpan[] {
  const levelSpan = row.find((s) => s.role === "level");
  if (!levelSpan) {
    return row;
  }
  const idx = row.indexOf(levelSpan);
  const next = row[idx + 1];
  if (next?.role === "message" && next.text === " ") {
    return [levelSpan, next];
  }
  return [levelSpan];
}

/** Level + gap spans, then body in the message column, then aligned `[module]`. */
export function alignBodyBeforeTrailingModule(
  leadSpans: LogSpan[],
  bodySpans: LogSpan[],
  moduleSpan: LogSpan,
): LogSpan[] {
  const bodyW = spansPlainWidth(bodySpans);
  const pad = Math.max(0, spec.messageWidth - bodyW);
  return [
    ...leadSpans,
    ...bodySpans,
    ...(pad > 0 ? [{ text: " ".repeat(pad), role: "message" as const }] : []),
    { text: " ", role: "message" },
    moduleSpan,
  ];
}
