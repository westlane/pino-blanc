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

const previewRecords = new WeakMap<HTMLElement, PinoLogRecord[]>();

function recordsFor(panel: HTMLElement): PinoLogRecord[] {
  let list = previewRecords.get(panel);
  if (!list) {
    list = [];
    previewRecords.set(panel, list);
  }
  return list;
}

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
  const base = htmlLogHostStyle(theme);
  // Panel chrome (fill/border) lives on `.demo-frame` / `.demo-tablist` via
  // `--glass-panel` so sidebar and log stay identical in both schemes.
  const hostStyle = base.replace(/background:\s*[^;]+/, "background: transparent");
  host.style.cssText = [
    hostStyle,
    "font-size: 11px",
    "line-height: 1.25",
    "padding: 1.8rem 0.65rem 0.45rem",
    "box-sizing: border-box",
    "width: 100%",
    "max-width: 100%",
    "min-width: 0",
    "min-height: 0",
    "flex: 1 1 auto",
    "overflow-x: hidden",
    "overflow-y: auto",
    "overscroll-behavior: contain",
    "border-radius: 0",
    "border: none",
    "box-shadow: none",
    "backdrop-filter: none",
    "-webkit-backdrop-filter: none",
  ].join("; ");
}

function paintRecordLine(
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
}

export function appendRecordHtml(
  panel: HTMLElement,
  record: PinoLogRecord,
  options: CreateLoggerOptions,
): void {
  recordsFor(panel).push(record);
  paintRecordLine(panel, record, options);
  panel.scrollTop = panel.scrollHeight;
}

/**
 * Re-paint stored lines with the current theme: same events, new colors.
 * Used on light/dark toggle so we don't emit a fresh burst.
 */
export function restyleLogPreview(
  panel: HTMLElement,
  options: CreateLoggerOptions,
): void {
  const records = recordsFor(panel);
  const stickBottom =
    panel.scrollHeight - panel.scrollTop - panel.clientHeight < 24;
  panel.replaceChildren();
  for (const record of records) {
    paintRecordLine(panel, record, options);
  }
  if (stickBottom) {
    panel.scrollTop = panel.scrollHeight;
  }
}

export type LogPreview = (
  level: LogLevelName,
  module: string,
  msg: string,
  fields?: object,
) => void;

export function createLogPreview(
  panel: HTMLElement,
  getOptions: () => CreateLoggerOptions,
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
    appendRecordHtml(panel, record, getOptions());
  };
}

export function clearLogPreview(panel: HTMLElement): void {
  previewRecords.set(panel, []);
  panel.replaceChildren();
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
