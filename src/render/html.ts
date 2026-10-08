import { createTintResolver, resolveTheme } from "../color/theme.js";
import { themeSurfaceHex } from "../color/chrome.js";
import { resolvePinoLogLine } from "../format/from-record.js";
import { levelFromPinoNumber } from "../node/levels.js";
import type { CreateLoggerOptions, LogSpan, LogTheme, PinoLogRecord, TintResolver } from "../types.js";
import { collectStyledParts, type StyledPart } from "./styled-parts.js";

export type { StyledPart } from "./styled-parts.js";
export { collectStyledParts } from "./styled-parts.js";

export function escapeHtml(text: string): string {
  return text
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

export function renderHtmlParts(parts: StyledPart[]): string {
  return parts
    .map((part) => {
      if (!part.css) {
        return escapeHtml(part.text);
      }
      return `<span style="${part.css}">${escapeHtml(part.text)}</span>`;
    })
    .join("");
}

export function renderHtml(
  spans: LogSpan[],
  theme: LogTheme,
  tint: TintResolver,
  level: string,
  options: CreateLoggerOptions = {},
): string {
  return renderHtmlParts(collectStyledParts(spans, theme, tint, level, options));
}

/** Inline CSS for a log host element (monospace, preserve layout pads, theme surface). */
export function htmlLogHostStyle(theme: LogTheme): string {
  const surface = themeSurfaceHex(theme);
  const message = theme.roles?.message ?? (theme.background === "light" ? "#073642" : "#eee8d5");
  return [
    `background: ${surface}`,
    `color: ${message}`,
    'font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
    "font-size: 13px",
    "line-height: 1.35",
    "white-space: pre",
    "overflow-x: auto",
    "padding: 0.75rem 1rem",
    "border-radius: 6px",
  ].join("; ");
}

export function formatRecordHtml(
  record: PinoLogRecord,
  options: CreateLoggerOptions = {},
): string | null {
  const theme = resolveTheme(options.theme, options.themeOverrides);
  const tint = createTintResolver(theme, options.colorize, options.tint);
  const resolved = resolvePinoLogLine(record, options);
  if (resolved.mode === "empty") {
    return null;
  }
  if (resolved.mode === "line") {
    return escapeHtml(resolved.line);
  }
  const level = levelFromPinoNumber(record.level);
  return renderHtml(resolved.spans, theme, tint, level, options);
}
