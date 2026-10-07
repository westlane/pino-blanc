import { resolvePrettyColor } from "../color/gate.js";
import { createTintResolver, resolveTheme } from "../color/theme.js";
import { CONSOLE_TRIPLE_COLOR_RESET } from "../format/console-output.js";
import { renderAnsi } from "../render/ansi.js";
import { renderCss, type CssConsolePayload } from "../render/css.js";
import { renderPlain } from "../render/plain.js";
import type { CreateLoggerOptions, LogSpan } from "../types.js";

export type RenderedSessionBanner =
  | { mode: "ansi"; line: string }
  | { mode: "css"; payload: CssConsolePayload }
  | { mode: "plain"; line: string };

/** Render session banner spans for Node or browser console. */
export function renderSessionBannerBlock(
  spans: LogSpan[],
  options: CreateLoggerOptions = {},
): RenderedSessionBanner {
  const theme = resolveTheme(options.theme, options.themeOverrides);
  const tint = createTintResolver(
    theme,
    options.colorize,
    options.tint,
  );
  const level = "info";

  if (typeof process !== "undefined" && process.versions?.node) {
    if (!resolvePrettyColor(options)) {
      return { mode: "plain", line: renderPlain(spans) };
    }
    const line =
      renderAnsi(spans, theme, tint, level, true, options) +
      CONSOLE_TRIPLE_COLOR_RESET;
    return { mode: "ansi", line };
  }

  const payload = renderCss(spans, theme, tint, level, options);
  return { mode: "css", payload };
}

export function writeSessionBannerToConsole(
  rendered: RenderedSessionBanner,
  method: "info" | "error" = "info",
): void {
  const fn = method === "error" ? console.error : console.info;
  if (rendered.mode === "css") {
    fn(rendered.payload.text, ...rendered.payload.styles);
    return;
  }
  fn(rendered.line);
}
