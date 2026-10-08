import {
  chromeColors,
  readableForeground,
  SURFACE_WHITE_HEX,
} from "../color/chrome.js";
import { colorFromIdAvoiding } from "../color/id.js";
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

export type ChipPaint = (
  text: string,
  background: string,
  foreground: string,
  bold?: boolean,
) => string;

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

/** Level hues reserved for alerts: never use these for module `[tags]`. */
const MODULE_TAG_RESERVED_LEVELS = ["warn", "error", "fatal"] as const;

function rowEmphasisHex(ctx: SpanRenderContext): string | undefined {
  const level = ctx.level.trim().toLowerCase();
  if (!ROW_LEVEL_EMPHASIS.has(level)) {
    return undefined;
  }
  return levelHex(ctx.theme, level);
}

function alertLevelHexes(theme: LogTheme): Set<string> {
  const out = new Set<string>();
  for (const level of MODULE_TAG_RESERVED_LEVELS) {
    const hex = levelHex(theme, level);
    if (hex) {
      out.add(hex.toLowerCase());
    }
  }
  return out;
}

function isAlertLevelHex(theme: LogTheme, hex: string): boolean {
  return alertLevelHexes(theme).has(hex.toLowerCase());
}

/** Per-module tint, skipping warn/error/fatal reds so tags ≠ alerts. */
function resolveModuleTagHex(
  tintKey: string,
  ctx: SpanRenderContext,
): string | undefined {
  const resolved = ctx.tint.resolve(tintKey);
  if (resolved && !isAlertLevelHex(ctx.theme, resolved)) {
    return resolved;
  }
  const avoided = colorFromIdAvoiding(
    tintKey,
    ctx.theme.tintRamp ?? [],
    alertLevelHexes(ctx.theme),
  );
  if (!isAlertLevelHex(ctx.theme, avoided)) {
    return avoided;
  }
  return roleHex(ctx.theme, "module");
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
    if (span.role === "module") {
      return resolveModuleTagHex(span.tintKey, ctx);
    }
    return ctx.tint.resolve(span.tintKey) ?? undefined;
  }
  if (span.role === "level") {
    return levelHex(ctx.theme, ctx.level.trim().toLowerCase());
  }
  return roleHex(ctx.theme, span.role);
}

/** Column trailing spaces keep the chip background (invisible pad). */
function paintWithColumnPad(
  text: string,
  background: string,
  foreground: string,
  paint: ChipPaint,
  bold?: boolean,
): string {
  const trimmedEnd = text.trimEnd();
  const trailingPad = text.slice(trimmedEnd.length);
  const main = paint(trimmedEnd, background, foreground, bold);
  if (!trailingPad) {
    return main;
  }
  return `${main}${paint(trailingPad, background, background)}`;
}

/**
 * Identity chip paint (event-column semantics):
 * - `prefix`: saturated glyph box + saturated body (actors)
 * - `fill`: white glyph box + 25% tinted body (resource `/` `_` subjects)
 */
export function renderChipParts(
  span: LogSpan,
  ctx: SpanRenderContext,
  paint: ChipPaint,
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
      const glyph = paint(
        split.glyph,
        glyphColors.background,
        glyphColors.foreground,
        true,
      );
      const body = paint(
        split.body,
        bodyColors.background,
        bodyColors.foreground,
      );
      const pad = trailingPad
        ? paint(trailingPad, bodyColors.background, bodyColors.background)
        : "";
      return `${glyph}${body}${pad}`;
    }
  }

  if (chrome === "fill") {
    const split = splitPrefix(trimmedEnd, map);
    if (split) {
      const bodyColors = chromeColors(identity, "fill", ctx.theme);
      const glyphFg = readableForeground(SURFACE_WHITE_HEX, identity);
      const glyph = paint(split.glyph, SURFACE_WHITE_HEX, glyphFg);
      const body = paint(
        split.body,
        bodyColors.background,
        bodyColors.foreground,
      );
      const pad = trailingPad
        ? paint(trailingPad, bodyColors.background, bodyColors.background)
        : "";
      return `${glyph}${body}${pad}`;
    }
  }

  const colors = chromeColors(identity, chrome, ctx.theme);
  return paintWithColumnPad(
    span.text,
    colors.background,
    colors.foreground,
    paint,
  );
}
