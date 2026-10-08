import { resolvePrettyColor } from "../color/gate.js";
import { createTintResolver, resolveTheme } from "../color/theme.js";
import { buildBoxSpans } from "./box-spans.js";
import { DEFAULT_LAYOUT } from "../layout/layout-ids.js";
import { renderAnsi } from "../render/ansi.js";
import type { CreateLoggerOptions, LogSpan, LogTheme, LogThemeId } from "../types.js";

/**
 * Full `box.default` from layout.yml — padding bands + centered `%title%`.
 * Hyphen-only `[----…]` rows become empty tinted bars above/below the title.
 * Uses `role: "box"` (theme `roles.box`).
 */
export function bannerLogSpans(title: string, boxLayout: string = DEFAULT_LAYOUT): LogSpan[] {
  return buildBoxSpans({
    boxLayout,
    title,
  }).map((span) => {
    if (span.role !== "banner" || span.bannerChrome !== "app") {
      return span;
    }
    const { bannerChrome: _chrome, tintKey: _tint, ...rest } = span;
    return { ...rest, role: "box" as const };
  });
}

/** Render a layout.yml `box` preset (default: padded `box.default`). */
export function renderBannerLine(
  title: string,
  theme?: LogThemeId | LogTheme,
  options: CreateLoggerOptions = {},
): string {
  const resolved = resolveTheme(theme ?? options.theme, options.themeOverrides);
  const tint = createTintResolver(
    resolved,
    options.colorize,
    options.tint,
  );
  return renderAnsi(
    bannerLogSpans(title),
    resolved,
    tint,
    "info",
    resolvePrettyColor(options),
    options,
  );
}
