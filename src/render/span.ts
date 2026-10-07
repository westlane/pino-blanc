import { chromeColors } from "../color/chrome.js";
import { levelHex, roleHex } from "../color/theme.js";
import { splitPrefix } from "../layout/symbol.js";
import type {
  ChipChrome,
  CreateLoggerOptions,
  LogSpan,
  LogTheme,
  TintResolver,
} from "../types.js";

export type SpanRenderContext = {
  theme: LogTheme;
  tint: TintResolver;
  level: string;
  options: CreateLoggerOptions;
};

export function resolveIdentityHex(
  span: LogSpan,
  tint: TintResolver,
): string | undefined {
  if (!span.tintKey) {
    return undefined;
  }
  return tint.resolve(span.tintKey) ?? undefined;
}

const ROW_LEVEL_EMPHASIS = new Set(["warn", "error"]);

function rowEmphasisHex(ctx: SpanRenderContext): string | undefined {
  const level = ctx.level.trim().toLowerCase();
  if (!ROW_LEVEL_EMPHASIS.has(level)) {
    return undefined;
  }
  return levelHex(ctx.theme, level);
}

export function resolveSpanHex(
  span: LogSpan,
  ctx: SpanRenderContext,
): string | undefined {
  const emphasis = rowEmphasisHex(ctx);
  if (
    emphasis &&
    (span.role === "level" || span.role === "module" || span.role === "message")
  ) {
    return emphasis;
  }
  if (span.tintKey) {
    return ctx.tint.resolve(span.tintKey) ?? undefined;
  }
  if (span.role === "level") {
    return levelHex(ctx.theme, ctx.level.trim().toLowerCase());
  }
  return roleHex(ctx.theme, span.role);
}

export function renderChipParts(
  span: LogSpan,
  ctx: SpanRenderContext,
  paint: (
    text: string,
    background: string,
    foreground: string,
    bold?: boolean,
  ) => string,
): string {
  const identity = resolveIdentityHex(span, ctx.tint);
  if (!identity) {
    return span.text;
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
      const glyph = paint(split.glyph, glyphColors.background, glyphColors.foreground, true);
      const body = paint(split.body, bodyColors.background, bodyColors.foreground);
      return `${glyph}${body}${trailingPad}`;
    }
  }

  const colors = chromeColors(identity, chrome, ctx.theme);
  return `${paint(trimmedEnd, colors.background, colors.foreground)}${trailingPad}`;
}
