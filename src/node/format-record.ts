import { formatStandardSpans } from "../layout/line.js";
import { createTintResolver, resolveTheme } from "../color/theme.js";
import { renderAnsi } from "../render/ansi.js";
import { stripAnsiForPlainOutput } from "../render/plain.js";
import type { ColumnDecorator, CreateLoggerOptions } from "../types.js";
import { levelFromPinoNumber } from "./levels.js";
export type FormatContext = {
  options: CreateLoggerOptions;
  columns?: ColumnDecorator;
};

export function formatPinoLogLine(
  input: {
    level: number;
    msg?: string;
    module?: string;
    time?: number;
    [key: string]: unknown;
  },
  ctx: FormatContext,
  plain = false,
): string {
  const theme = resolveTheme(ctx.options.theme, ctx.options.themeOverrides);
  const tint = createTintResolver(
    theme,
    ctx.options.colorTransform,
    ctx.options.tint,
  );
  const level = levelFromPinoNumber(input.level);
  const module = String(input.module ?? "app");
  const message = String(input.msg ?? "");
  let spans = formatStandardSpans(level, module, message);
  if (ctx.columns) {
    spans = ctx.columns.decorate(spans, {
      level,
      module,
      meta: input,
    });
  }
  const colored = renderAnsi(spans, theme, tint, level, !plain);
  return plain ? stripAnsiForPlainOutput(colored) : colored;
}
