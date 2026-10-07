import pino from "pino";
import type { BlancLogger, CreateLoggerOptions } from "../types.js";
import { toPinoLevel } from "./levels.js";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

function prettyTargetPath(): string {
  const here = dirname(fileURLToPath(import.meta.url));
  return join(here, "transport", "pretty.js");
}

function wrapPino(
  logger: pino.Logger,
  options: CreateLoggerOptions,
): BlancLogger {
  const logAt = (
    level: string,
    msg: string,
    meta?: object,
  ): void => {
    const bindings = meta ?? {};
    switch (level) {
      case "trace":
        logger.trace(bindings, msg);
        break;
      case "debug":
        logger.debug(bindings, msg);
        break;
      case "warn":
        logger.warn(bindings, msg);
        break;
      case "error":
        logger.error(bindings, msg);
        break;
      case "fatal":
        logger.fatal(bindings, msg);
        break;
      default:
        logger.info(bindings, msg);
    }
  };

  return {
    pino: logger,
    child(bindings) {
      const mod = bindings.module;
      return wrapPino(logger.child({ module: mod }), options);
    },
    trace: (m, meta) => logAt("trace", m, meta),
    debug: (m, meta) => logAt("debug", m, meta),
    info: (m, meta) => logAt("info", m, meta),
    warn: (m, meta) => logAt("warn", m, meta),
    error: (m, meta) => logAt("error", m, meta),
    fatal: (m, meta) => logAt("fatal", m, meta),
    event: (m, meta) => logAt("info", m, { ...meta, noirEvent: true }),
  };
}

export function createLogger(
  module = "app",
  options: CreateLoggerOptions = {},
): BlancLogger {
  const level = toPinoLevel(
    options.level ? String(options.level) : "debug",
  );
  const usePlain = Boolean(options.plainStdout);
  const transport = pino.transport({
    target: prettyTargetPath(),
    options: {
      options,
      columns: options.columns,
    },
  });

  const logger = pino(
    {
      level,
      base: { module },
      timestamp: pino.stdTimeFunctions.isoTime,
    },
    usePlain
      ? pino.transport({
          target: prettyTargetPath(),
          options: {
            options: { ...options, plainStdout: true },
            columns: options.columns,
          },
        })
      : transport,
  );

  return wrapPino(logger, options);
}

export { parseLevelName } from "../parse-level.js";
