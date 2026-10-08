import { resolvePrettyColor } from "../color/gate.js";
import { createTintResolver, resolveTheme } from "../color/theme.js";
import { buildBoxSpans } from "./box-spans.js";
import { COMPLEX_LAYOUT, DEFAULT_LAYOUT } from "../layout/layout-ids.js";
import { renderAnsi } from "../render/ansi.js";
import type { CreateLoggerOptions, LogSpan, LogTheme, LogThemeId } from "../types.js";

export type BannerFields = {
  title: string;
  /** When set, uses `box.complex` (title + subtitle bands). */
  subtitle?: string;
  version?: string;
  level?: string;
  /** Override layout.yml box preset (`default` / `complex`). */
  boxLayout?: string;
};

function normalizeBannerFields(
  titleOrFields: string | BannerFields,
  boxLayout?: string,
): BannerFields {
  if (typeof titleOrFields === "string") {
    return { title: titleOrFields, ...(boxLayout ? { boxLayout } : {}) };
  }
  return boxLayout && !titleOrFields.boxLayout
    ? { ...titleOrFields, boxLayout }
    : titleOrFields;
}

/**
 * Layout.yml `box` bands as theme `roles.box` bars.
 * With `subtitle`, uses `box.complex` (pad + title + pad + subtitle + pad).
 * Two-content boxes keep the first section white (`banner` + app chrome);
 * later bands use theme box color.
 */
export function bannerLogSpans(
  titleOrFields: string | BannerFields,
  boxLayout?: string,
): LogSpan[] {
  const fields = normalizeBannerFields(titleOrFields, boxLayout);
  const twoContent =
    fields.subtitle !== undefined ||
    fields.version !== undefined ||
    fields.level !== undefined ||
    fields.boxLayout === COMPLEX_LAYOUT;
  const layout =
    fields.boxLayout ?? (twoContent ? COMPLEX_LAYOUT : DEFAULT_LAYOUT);
  return buildBoxSpans({
    boxLayout: layout,
    title: fields.title,
    subtitle: fields.subtitle,
    version: fields.version,
    level: fields.level,
  }).map((span) => {
    if (span.role !== "banner") {
      return span;
    }
    // Two-row boxes: keep first section (app chrome) white; color the rest.
    if (twoContent && span.bannerChrome === "app") {
      return span;
    }
    const { bannerChrome: _chrome, tintKey: _tint, ...rest } = span;
    return { ...rest, role: "box" as const };
  });
}

/** Render a layout.yml `box` (default or complex when subtitle/version/level set). */
export function renderBannerLine(
  titleOrFields: string | BannerFields,
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
    bannerLogSpans(titleOrFields),
    resolved,
    tint,
    "info",
    resolvePrettyColor(options),
    options,
  );
}
