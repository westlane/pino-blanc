import type { CreateLoggerOptions, LogSpan, LogTheme, TintResolver } from "../types.js";
import { collectStyledParts } from "./styled-parts.js";

export type CssConsolePayload = {
  text: string;
  styles: string[];
};

function pushCssPart(
  text: string,
  css: string,
  payload: CssConsolePayload,
): void {
  payload.text += `%c${text}`;
  payload.styles.push(css);
}

export function renderCss(
  spans: LogSpan[],
  theme: LogTheme,
  tint: TintResolver,
  level: string,
  options: CreateLoggerOptions = {},
): CssConsolePayload {
  const parts = collectStyledParts(spans, theme, tint, level, options);
  const payload: CssConsolePayload = { text: "", styles: [] };
  for (const part of parts) {
    pushCssPart(part.text, part.css, payload);
  }
  return payload;
}
