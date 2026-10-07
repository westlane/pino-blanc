import { resolvePrettyColor } from "../color/gate.js";
import { applyConsoleOutputHygiene } from "../format/console-output.js";
import { resolvePinoLogLine } from "../format/from-record.js";
import { createTintResolver, resolveTheme } from "../color/theme.js";
import { renderAnsi } from "../render/ansi.js";
import { stripAnsiForPlainOutput } from "../render/plain.js";
import type { ColumnDecorator, CreateLoggerOptions, PinoLogRecord } from "../types.js";
import { levelFromPinoNumber } from "./levels.js";

export type FormatContext = {
  options: CreateLoggerOptions;
  columns?: ColumnDecorator;
};

export function formatPinoLogLine(
  input: PinoLogRecord,
  ctx: FormatContext,
  plain = false,
): string {
  const resolved = resolvePinoLogLine(input, ctx.options, ctx.columns);
  if (resolved.mode === "empty") {
    return "";
  }

  if (resolved.mode === "line") {
    let line = resolved.line;
    if (!plain) {
      line = applyConsoleOutputHygiene(line, input, ctx.options);
    } else {
      line = stripAnsiForPlainOutput(line);
    }
    return line;
  }

  const theme = resolveTheme(ctx.options.theme, ctx.options.themeOverrides);
  const tint = createTintResolver(
    theme,
    ctx.options.colorize,
    ctx.options.tint,
  );
  const levelName = levelFromPinoNumber(input.level);
  const useColor = resolvePrettyColor(ctx.options, plain);
  let colored = renderAnsi(
    resolved.spans,
    theme,
    tint,
    levelName,
    useColor,
    ctx.options,
  );
  if (useColor) {
    colored = applyConsoleOutputHygiene(colored, input, ctx.options);
  } else {
    colored = stripAnsiForPlainOutput(colored);
  }
  return colored;
}
