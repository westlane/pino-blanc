import { resolveLayoutTemplate } from "../../layouts/index.js";
import type { LogSpan, LogLevelName } from "../types.js";
import { formatLayoutSpans } from "./template.js";

export function formatStandardSpans(
  level: LogLevelName,
  module: string,
  message: string,
  layout?: string,
  emoji?: string,
): LogSpan[] {
  return formatLayoutSpans(resolveLayoutTemplate(layout), {
    level,
    module,
    message,
    emoji,
  });
}

export function spansToPlain(spans: LogSpan[]): string {
  return spans.map((s) => s.text).join("");
}
