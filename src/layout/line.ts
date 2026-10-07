import spec from "../../spec/const.json" with { type: "json" };
import { padEndDisplay } from "./pad.js";
import type { LogSpan, LogLevelName } from "../types.js";

export function formatStandardSpans(
  level: LogLevelName,
  module: string,
  message: string,
): LogSpan[] {
  const levelText = padEndDisplay(level.toUpperCase(), spec.levelWidth);
  const mod = `[${module}]`;
  const moduleText = padEndDisplay(mod, spec.moduleWidth);
  return [
    { text: levelText, role: "level" },
    { text: " ", role: "message" },
    { text: moduleText, role: "module", tintKey: module },
    { text: " ", role: "message" },
    { text: message, role: "message" },
  ];
}

export function spansToPlain(spans: LogSpan[]): string {
  return spans.map((s) => s.text).join("");
}
