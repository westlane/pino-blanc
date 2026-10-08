import {
  boxChromeColors,
  chromeColors,
  readableForeground,
  SURFACE_WHITE_HEX,
} from "../color/chrome.js";
import { hexToCssChrome, hexToCssFg } from "../color/css.js";
import { splitPrefix } from "../layout/symbol.js";
import type { ChipChrome, CreateLoggerOptions, LogSpan, LogTheme, TintResolver } from "../types.js";
import { renderBannerBarCss } from "./banner-bar.js";
import { resolveIdentityHex, resolveSpanHex, type SpanRenderContext } from "./span.js";

export type StyledPart = {
  text: string;
  css: string;
};

function pushPart(parts: StyledPart[], text: string, css: string): void {
  parts.push({ text, css });
}

function pushChipSpan(span: LogSpan, ctx: SpanRenderContext, parts: StyledPart[]): void {
  const identity = resolveIdentityHex(span, ctx.tint);
  if (!identity) {
    pushPart(parts, span.text, "");
    return;
  }
  const chrome: ChipChrome = span.chrome ?? "inverted";
  const map = ctx.options.symbolMap;

  const trimmedEnd = span.text.trimEnd();
  const trailingPad = span.text.slice(trimmedEnd.length);

  if (chrome === "prefix") {
    const split = splitPrefix(trimmedEnd, map);
    if (split) {
      const glyphColors = chromeColors(identity, "prefix", ctx.theme);
      const bodyColors = chromeColors(identity, "inverted", ctx.theme);
      pushPart(
        parts,
        split.glyph,
        hexToCssChrome(glyphColors.background, glyphColors.foreground, true),
      );
      pushPart(
        parts,
        split.body,
        hexToCssChrome(bodyColors.background, bodyColors.foreground),
      );
      if (trailingPad) {
        pushPart(
          parts,
          trailingPad,
          hexToCssChrome(bodyColors.background, bodyColors.background),
        );
      }
      return;
    }
  }

  if (chrome === "fill") {
    const split = splitPrefix(trimmedEnd, map);
    if (split) {
      const bodyColors = chromeColors(identity, "fill", ctx.theme);
      const glyphFg = readableForeground(SURFACE_WHITE_HEX, identity);
      pushPart(parts, split.glyph, hexToCssChrome(SURFACE_WHITE_HEX, glyphFg));
      pushPart(
        parts,
        split.body,
        hexToCssChrome(bodyColors.background, bodyColors.foreground),
      );
      if (trailingPad) {
        pushPart(
          parts,
          trailingPad,
          hexToCssChrome(bodyColors.background, bodyColors.background),
        );
      }
      return;
    }
  }

  const colors = chromeColors(identity, chrome, ctx.theme);
  pushPart(parts, span.text, hexToCssChrome(colors.background, colors.foreground));
}

export function collectStyledParts(
  spans: LogSpan[],
  theme: LogTheme,
  tint: TintResolver,
  level: string,
  options: CreateLoggerOptions = {},
): StyledPart[] {
  const ctx: SpanRenderContext = { theme, tint, level, options };
  const parts: StyledPart[] = [];

  for (const span of spans) {
    if (span.raw) {
      pushPart(parts, span.text, "");
      continue;
    }
    if (span.role === "banner") {
      pushPart(parts, span.text, renderBannerBarCss(span, ctx));
      continue;
    }
    if (span.role === "box") {
      const colors = boxChromeColors(theme);
      pushPart(
        parts,
        span.text,
        hexToCssChrome(colors.background, colors.foreground, true),
      );
      continue;
    }
    if (span.role === "chip" && span.tintKey) {
      pushChipSpan(span, ctx, parts);
      continue;
    }
    const hex = resolveSpanHex(span, ctx);
    const css = hex ? hexToCssFg(hex) : "";
    pushPart(parts, span.text, css);
  }
  return parts;
}
