import { wrapAnsi, wrapAnsiChrome } from "../color/ansi.js";
import { supportsColors } from "../color/gate.js";
import type { CreateLoggerOptions, LogSpan, LogTheme, TintResolver } from "../types.js";
import { renderPlain } from "./plain.js";
import { renderBannerBarAnsi } from "./banner-bar.js";
import { renderChipParts, resolveSpanHex, type SpanRenderContext } from "./span.js";

export function renderAnsi(
  spans: LogSpan[],
  theme: LogTheme,
  tint: TintResolver,
  level: string,
  useColor = supportsColors(),
  options: CreateLoggerOptions = {},
): string {
  if (!useColor) {
    return renderPlain(spans);
  }
  const ctx: SpanRenderContext = { theme, tint, level, options };
  return spans
    .map((span) => {
      if (span.raw) {
        return span.text;
      }
      if (span.role === "banner") {
        return renderBannerBarAnsi(span, ctx);
      }
      if (span.role === "chip" && span.tintKey) {
        return renderChipParts(span, ctx, wrapAnsiChrome);
      }
      const hex = resolveSpanHex(span, ctx);
      return wrapAnsi(span.text, hex);
    })
    .join("");
}
