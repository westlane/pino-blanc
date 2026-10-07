import { resolvePinoLogLine } from "../format/from-record.js";
import { createTintResolver, resolveTheme } from "../color/theme.js";
import { renderCss } from "../render/css.js";
import { BLANC_EVENT_KEY } from "../record.js";
import type { BlancLogger, CreateLoggerOptions, LogLevelName } from "../types.js";
import { parseLevelName } from "../parse-level.js";
function toPinoLevelNumber(level: LogLevelName): number {
  switch (level) {
    case "trace":
      return 10;
    case "debug":
      return 20;
    case "info":
      return 30;
    case "warn":
      return 40;
    case "error":
      return 50;
    case "fatal":
      return 60;
    default:
      return 30;
  }
}

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
    options.colorize,
    options.tint,
  );

  const applyRedact = (fields?: object): Record<string, unknown> => {
    const base =
      fields && typeof fields === "object" && !Array.isArray(fields)
        ? { ...(fields as Record<string, unknown>) }
        : {};
    return options.redact ? options.redact(base) : base;
  };

  const emit = (level: string, msg: string, fields?: object): void => {
    const levelName = parseLevelName(level);
    const record = {
      level: toPinoLevelNumber(levelName),
      msg,
      module,
      ...applyRedact(fields),
    };
    const resolved = resolvePinoLogLine(record, options);
    const method = consoleMethod(levelName);
    if (resolved.mode === "empty") {
      return;
    }
    if (resolved.mode === "line") {
      console[method](resolved.line);
      return;
    }
    const { text, styles } = renderCss(
      resolved.spans,
      theme,
      tint,
      levelName,
      options,
    );
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
    trace: (m, fields) => emit("trace", m, fields),
    debug: (m, fields) => emit("debug", m, fields),
    info: (m, fields) => emit("info", m, fields),
    warn: (m, fields) => emit("warn", m, fields),
    error: (m, fields) => emit("error", m, fields),
    fatal: (m, fields) => emit("fatal", m, fields),
    event: (m, fields) =>
      emit("info", m, {
        ...applyRedact(fields),
        [BLANC_EVENT_KEY]: true,
      } as object),
  };

  return api;
}
