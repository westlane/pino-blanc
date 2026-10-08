import pino from "pino";
import { PB_EVENT_KEY } from "../record.js";
import type {
  CreateLoggerOptions,
  FileLogOptions,
  PBLogger,
} from "../types.js";
import { toPinoLevel } from "./levels.js";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import buildPrettyStream, {
  type PrettyTransportOptions,
} from "./transport/pretty.js";
import "../layout/layout-store.node.js";

const LEVEL_VERBOSE_ORDER = [
  "trace",
  "debug",
  "info",
  "warn",
  "error",
  "fatal",
] as const;

function resolveFileOption(
  file?: string | FileLogOptions,
): FileLogOptions | undefined {
  if (!file) {
    return undefined;
  }
  if (typeof file === "string") {
    return { path: file, mkdir: true };
  }
  return { mkdir: true, ...file };
}

function mostVerboseLevel(a: string, b: string): string {
  const ai = LEVEL_VERBOSE_ORDER.indexOf(a as (typeof LEVEL_VERBOSE_ORDER)[number]);
  const bi = LEVEL_VERBOSE_ORDER.indexOf(b as (typeof LEVEL_VERBOSE_ORDER)[number]);
  if (ai === -1) {
    return b;
  }
  if (bi === -1) {
    return a;
  }
  return ai <= bi ? a : b;
}

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
): PBLogger {
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
      logAt("info", m, { ...applyRedact(options, fields), [PB_EVENT_KEY]: true }),
  };
}

function buildLoggerDestination(
  resolvedOptions: CreateLoggerOptions,
  formatCtx: PrettyTransportOptions,
  consoleLevel: string,
  fileOpts: FileLogOptions | undefined,
  fileLevel: string | undefined,
): pino.DestinationStream {
  if (!fileOpts || !fileLevel) {
    return optionsNeedMainThread(resolvedOptions)
      ? buildPrettyStream(formatCtx)
      : pino.transport({
          target: prettyTargetPath(),
          options: formatCtx,
          worker: { env: prettyTransportWorkerEnv() },
          ...(resolvedOptions.prettyTransportSync ? { sync: true } : {}),
        } as pino.TransportSingleOptions<typeof formatCtx> & { sync?: boolean });
  }

  const fileDest = pino.destination({
    dest: fileOpts.path,
    mkdir: fileOpts.mkdir ?? true,
    sync: Boolean(resolvedOptions.syncPretty),
  });

  if (optionsNeedMainThread(resolvedOptions)) {
    const prettyStream = buildPrettyStream(formatCtx);
    return pino.multistream([
      { level: consoleLevel, stream: prettyStream },
      { level: fileLevel, stream: fileDest },
    ]);
  }

  return pino.transport({
    targets: [
      {
        target: prettyTargetPath(),
        options: formatCtx,
        level: consoleLevel,
        worker: { env: prettyTransportWorkerEnv() },
      },
      {
        target: "pino/file",
        options: {
          destination: fileOpts.path,
          mkdir: fileOpts.mkdir ?? true,
        },
        level: fileLevel,
      },
    ],
    ...(resolvedOptions.prettyTransportSync ? { sync: true } : {}),
  } as pino.TransportMultiOptions);
}

export function createLogger(
  module = "app",
  options: CreateLoggerOptions = {},
): PBLogger {
  const resolvedOptions: CreateLoggerOptions = {
    ...options,
    forceColor:
      options.forceColor ??
      (process.env.PINO_BLANC_FORCE_COLOR === "0" ? false : true),
  };
  const level = toPinoLevel(
    resolvedOptions.level ? String(resolvedOptions.level) : "debug",
  );
  const formatCtx: PrettyTransportOptions = {
    options: resolvedOptions,
    columns: resolvedOptions.columns,
    destination: resolvedOptions.consoleDestination,
  };

  const fileOpts = resolveFileOption(resolvedOptions.file);
  const fileLevel = fileOpts
    ? toPinoLevel(fileOpts.level ? String(fileOpts.level) : "info")
    : undefined;
  const rootLevel = fileLevel ? mostVerboseLevel(level, fileLevel) : level;

  const destination = buildLoggerDestination(
    resolvedOptions,
    formatCtx,
    level,
    fileOpts,
    fileLevel,
  );

  const logger = pino(
    {
      level: rootLevel,
      base: { module },
      timestamp: pino.stdTimeFunctions.isoTime,
    },
    destination,
  );

  return wrapPino(logger, resolvedOptions);
}

export { parseLevelName } from "../parse-level.js";
