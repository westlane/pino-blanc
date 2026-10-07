import pino from "pino";
import type { BlancLogger, CreateLoggerOptions } from "../types.js";
import { toPinoLevel } from "./levels.js";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import buildPrettyStream from "./transport/pretty.js";

function optionsNeedMainThread(options: CreateLoggerOptions): boolean {
  return Boolean(
    options.colorTransform ||
      options.tint ||
      options.columns ||
      options.themeOverrides,
  );
}

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
  const formatCtx = {
    options,
    columns: options.columns,
  };

  const destination = optionsNeedMainThread(options)
    ? buildPrettyStream(formatCtx)
    : pino.transport({
        target: prettyTargetPath(),
        options: formatCtx,
      });

  const logger = pino(
    {
      level,
      base: { module },
      timestamp: pino.stdTimeFunctions.isoTime,
    },
    destination,
  );

  return wrapPino(logger, options);
}

export { parseLevelName } from "../parse-level.js";
