import pino from "pino";
import { BLANC_EVENT_KEY } from "../record.js";
import type { BlancLogger, CreateLoggerOptions } from "../types.js";
import { toPinoLevel } from "./levels.js";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import buildPrettyStream from "./transport/pretty.js";

function optionsNeedMainThread(options: CreateLoggerOptions): boolean {
  return Boolean(
    options.syncPretty ||
      options.colorize ||
      options.tint ||
      options.columns ||
      options.formatRecord ||
      options.consoleLeadingNewline ||
      options.consoleColorReset === "triple" ||
      (options.symbolMap && Object.keys(options.symbolMap).length > 0) ||
      options.themeOverrides,
  );
}

function prettyTargetPath(): string {
  const here = dirname(fileURLToPath(import.meta.url));
  return join(here, "transport", "pretty.js");
}

/** Worker `process.env` — stdout is not a TTY in the thread; honor FORCE_COLOR. */
function prettyTransportWorkerEnv(): NodeJS.ProcessEnv {
  const env = { ...process.env };
  if (env.FORCE_COLOR !== undefined && env.FORCE_COLOR !== "0") {
    delete env.NO_COLOR;
  }
  return env;
}

function applyRedact(
  options: CreateLoggerOptions,
  fields?: object,
): Record<string, unknown> {
  const base =
    fields && typeof fields === "object" && !Array.isArray(fields)
      ? { ...(fields as Record<string, unknown>) }
      : {};
  return options.redact ? options.redact(base) : base;
}

function wrapPino(
  logger: pino.Logger,
  options: CreateLoggerOptions,
): BlancLogger {
  const logAt = (
    level: string,
    msg: string,
    fields?: object,
  ): void => {
    const bindings = applyRedact(options, fields);
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
    trace: (m, fields) => logAt("trace", m, fields),
    debug: (m, fields) => logAt("debug", m, fields),
    info: (m, fields) => logAt("info", m, fields),
    warn: (m, fields) => logAt("warn", m, fields),
    error: (m, fields) => logAt("error", m, fields),
    fatal: (m, fields) => logAt("fatal", m, fields),
    event: (m, fields) =>
      logAt("info", m, { ...applyRedact(options, fields), [BLANC_EVENT_KEY]: true }),
  };
}

export function createLogger(
  module = "app",
  options: CreateLoggerOptions = {},
): BlancLogger {
  const resolvedOptions: CreateLoggerOptions = {
    ...options,
    forceColor:
      options.forceColor ??
      (process.env.PINO_BLANC_FORCE_COLOR === "0" ? false : true),
  };
  const level = toPinoLevel(
    resolvedOptions.level ? String(resolvedOptions.level) : "debug",
  );
  const formatCtx = {
    options: resolvedOptions,
    columns: resolvedOptions.columns,
  };

  const destination = optionsNeedMainThread(resolvedOptions)
    ? buildPrettyStream(formatCtx)
    : pino.transport({
        target: prettyTargetPath(),
        options: formatCtx,
        worker: { env: prettyTransportWorkerEnv() },
        ...(resolvedOptions.prettyTransportSync ? { sync: true } : {}),
      } as pino.TransportSingleOptions<typeof formatCtx> & { sync?: boolean });

  const logger = pino(
    {
      level,
      base: { module },
      timestamp: pino.stdTimeFunctions.isoTime,
    },
    destination,
  );

  return wrapPino(logger, resolvedOptions);
}

export { parseLevelName } from "../parse-level.js";
