import {
  formatRecordHtml,
  htmlLogHostStyle,
  PB_EVENT_KEY,
  resolveTheme,
  type CreateLoggerOptions,
  type LogLevelName,
  type PBLogger,
  type PinoLogRecord,
} from "@westlane/pino-blanc/browser";

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

export function applyLogHostStyle(host: HTMLElement, options: CreateLoggerOptions): void {
  const theme = resolveTheme(options.theme, options.themeOverrides);
  host.style.cssText = [
    htmlLogHostStyle(theme),
    "font-size: 11px",
    "line-height: 1.25",
    "padding: 0.45rem 0.65rem",
    "box-sizing: border-box",
    "width: 100%",
    "max-width: 100%",
    "min-width: 0",
    "min-height: 0",
    "flex: 1 1 auto",
    "overflow-x: hidden",
    "overflow-y: auto",
    "overscroll-behavior: contain",
    "border-radius: 12px",
  ].join("; ");
}

export function appendRecordHtml(
  panel: HTMLElement,
  record: PinoLogRecord,
  options: CreateLoggerOptions,
): void {
  const html = formatRecordHtml(record, options);
  if (!html) {
    return;
  }
  const line = document.createElement("div");
  line.className = "pb-log-line";
  line.innerHTML = html;
  panel.appendChild(line);
  panel.scrollTop = panel.scrollHeight;
}

export type LogPreview = (
  level: LogLevelName,
  module: string,
  msg: string,
  fields?: object,
) => void;

export function createLogPreview(
  panel: HTMLElement,
  options: CreateLoggerOptions,
): LogPreview {
  return (level, module, msg, fields) => {
    const record: PinoLogRecord = {
      level: toPinoLevelNumber(level),
      msg,
      module,
      ...(fields && typeof fields === "object" && !Array.isArray(fields)
        ? (fields as Record<string, unknown>)
        : {}),
    };
    appendRecordHtml(panel, record, options);
  };
}

export function logAndPreview(
  log: PBLogger,
  preview: LogPreview,
  level: LogLevelName,
  module: string,
  msg: string,
  fields?: object,
): void {
  switch (level) {
    case "trace":
      log.trace(msg, fields);
      break;
    case "debug":
      log.debug(msg, fields);
      break;
    case "info":
      log.info(msg, fields);
      break;
    case "warn":
      log.warn(msg, fields);
      break;
    case "error":
      log.error(msg, fields);
      break;
    case "fatal":
      log.fatal(msg, fields);
      break;
    default:
      log.info(msg, fields);
  }
  preview(level, module, msg, fields);
}

export function logEventAndPreview(
  log: PBLogger,
  preview: LogPreview,
  module: string,
  eventName: string,
  fields?: object,
): void {
  log.event(eventName, fields);
  preview("info", module, eventName, {
    ...(fields && typeof fields === "object" && !Array.isArray(fields)
      ? fields
      : {}),
    [PB_EVENT_KEY]: true,
  });
}
