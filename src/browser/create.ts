import { formatStandardSpans } from "../layout/line.js";
import { createTintResolver, resolveTheme } from "../color/theme.js";
import { renderCss } from "../render/css.js";
import type { BlancLogger, CreateLoggerOptions } from "../types.js";
import { parseLevelName } from "../parse-level.js";

function consoleMethod(level: string): "log" | "info" | "warn" | "error" | "debug" {
  switch (level) {
    case "error":
    case "fatal":
      return "error";
    case "warn":
      return "warn";
    case "debug":
    case "trace":
      return "debug";
    default:
      return "info";
  }
}

export function createBrowserLogger(
  module = "app",
  options: CreateLoggerOptions = {},
): BlancLogger {
  const theme = resolveTheme(options.theme, options.themeOverrides);
  const tint = createTintResolver(
    theme,
    options.colorTransform,
    options.tint,
  );

  const emit = (level: string, msg: string, meta?: object): void => {
    const levelName = parseLevelName(level);
    let spans = formatStandardSpans(levelName, module, msg);
    if (options.columns) {
      spans = options.columns.decorate(spans, {
        level: levelName,
        module,
        meta,
      });
    }
    const { text, styles } = renderCss(spans, theme, tint, levelName);
    const method = consoleMethod(levelName);
    console[method](text, ...styles);
  };

  const stubPino = {
    child: () => stubPino,
  } as unknown as BlancLogger["pino"];

  const api: BlancLogger = {
    pino: stubPino,
    child(bindings) {
      return createBrowserLogger(bindings.module, options);
    },
    trace: (m, meta) => emit("trace", m, meta),
    debug: (m, meta) => emit("debug", m, meta),
    info: (m, meta) => emit("info", m, meta),
    warn: (m, meta) => emit("warn", m, meta),
    error: (m, meta) => emit("error", m, meta),
    fatal: (m, meta) => emit("fatal", m, meta),
    event: (m, meta) => emit("info", m, meta),
  };

  return api;
}
