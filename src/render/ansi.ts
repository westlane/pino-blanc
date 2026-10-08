import { wrapAnsi, wrapAnsiChrome } from "../color/ansi.js";
import { boxChromeColors } from "../color/chrome.js";
import { resolveAnsiMode } from "../color/gate.js";
import type { CreateLoggerOptions, LogSpan, LogTheme, TintResolver } from "../types.js";
import { renderPlain } from "./plain.js";
import { renderBannerBarAnsi } from "./banner-bar.js";
import { renderChipParts, resolveSpanHex, type SpanRenderContext } from "./span.js";

export function renderAnsi(
  spans: LogSpan[],
  theme: LogTheme,
  tint: TintResolver,
  level: string,
  useColor = true,
  options: CreateLoggerOptions = {},
): string {
  if (!useColor) {
    return renderPlain(spans);
  }
  const ctx: SpanRenderContext = { theme, tint, level, options };
  const palette = resolveAnsiMode(options);
  const paintChrome = (
    text: string,
    background: string,
    foreground: string,
    bold?: boolean,
  ) => wrapAnsiChrome(text, background, foreground, bold, palette);
  return spans
    .map((span) => {
      if (span.raw) {
        return span.text;
      }
      if (span.role === "banner") {
        return renderBannerBarAnsi(span, ctx, palette);
      }
      if (span.role === "box") {
        const colors = boxChromeColors(theme);
        return paintChrome(span.text, colors.background, colors.foreground, true);
      }
      if (span.role === "chip" && span.tintKey) {
        return renderChipParts(span, ctx, paintChrome);
      }
      const hex = resolveSpanHex(span, ctx);
      return wrapAnsi(span.text, hex, palette);
    })
    .join("");
}
