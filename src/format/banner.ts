import { resolvePrettyColor } from "../color/gate.js";
import { createTintResolver, resolveTheme } from "../color/theme.js";
import { formatBoxLine } from "../layout/box.js";
import { renderAnsi } from "../render/ansi.js";
import type { CreateLoggerOptions, LogSpan, LogTheme, LogThemeId } from "../types.js";

export function bannerLogSpans(title: string): LogSpan[] {
  return [{ text: formatBoxLine(title), role: "box" }];
}

/** Centered box line using the resolved theme (`theme.roles.box`). */
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
