import { stripAnsi } from "../layout/width.js";
import type { LogSpan } from "../types.js";

export function renderPlain(spans: LogSpan[]): string {
  return spans.map((s) => s.text).join("");
}

export { stripAnsi };

export function stripAnsiForPlainOutput(text: string): string {
  return stripAnsi(text)
    .replace(/\u001B\][^\u0007\u001B]*(\u0007|\u001B\\)/g, "")
    .replace(/\u001B\[[0-?]*[ -/]*[@-~]/g, "");
}
