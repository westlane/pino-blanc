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

function pushChipSpan(span: LogSpan, ctx: SpanRenderContext, payload: CssConsolePayload): void {
  const identity = resolveIdentityHex(span, ctx.tint);
  if (!identity) {
    pushCssPart(span.text, "", payload);
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
      pushCssPart(
        split.glyph,
        hexToCssChrome(glyphColors.background, glyphColors.foreground, true),
        payload,
      );
      pushCssPart(
        split.body,
        hexToCssChrome(bodyColors.background, bodyColors.foreground),
        payload,
      );
      if (trailingPad) {
        pushCssPart(
          trailingPad,
          hexToCssChrome(bodyColors.background, bodyColors.background),
          payload,
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
      pushCssPart(
        split.glyph,
        hexToCssChrome(SURFACE_WHITE_HEX, glyphFg),
        payload,
      );
      pushCssPart(
        split.body,
        hexToCssChrome(bodyColors.background, bodyColors.foreground),
        payload,
      );
      if (trailingPad) {
        pushCssPart(
          trailingPad,
          hexToCssChrome(bodyColors.background, bodyColors.background),
          payload,
        );
      }
      return;
    }
  }

  const colors = chromeColors(identity, chrome, ctx.theme);
  pushCssPart(
    span.text,
    hexToCssChrome(colors.background, colors.foreground),
    payload,
  );
}

export function renderCss(
  spans: LogSpan[],
  theme: LogTheme,
  tint: TintResolver,
  level: string,
  options: CreateLoggerOptions = {},
): CssConsolePayload {
  const ctx: SpanRenderContext = { theme, tint, level, options };
  const payload: CssConsolePayload = { text: "", styles: [""] };

  for (const span of spans) {
    if (span.raw) {
      pushCssPart(span.text, "", payload);
      continue;
    }
    if (span.role === "banner") {
      pushCssPart(span.text, renderBannerBarCss(span, ctx), payload);
      continue;
    }
    if (span.role === "box") {
      const colors = boxChromeColors(theme);
      pushCssPart(
        span.text,
        hexToCssChrome(colors.background, colors.foreground, true),
        payload,
      );
      continue;
    }
    if (span.role === "chip" && span.tintKey) {
      pushChipSpan(span, ctx, payload);
      continue;
    }
    const hex = resolveSpanHex(span, ctx);
    const css = hex ? hexToCssFg(hex) : "";
    pushCssPart(span.text, css, payload);
  }
  return payload;
}
