export type LogLevelName =
  | "trace"
  | "debug"
  | "info"
  | "warn"
  | "error"
  | "fatal";

export type LogSpanRole =
  | "level"
  | "module"
  | "message"
  | "meta"
  | "box"
  | "accent"
  | "chip"
  | "emoji"
  | "banner";

/** Full-width banner row chrome (`role: "banner"`). */
export type BannerChrome = "app" | ChipChrome;

export type ChipChrome = "fg" | "inverted" | "fill" | "faint" | "prefix";

export type SymbolMap = Record<string, string>;

/** Placeholders for `layout` / `formatLayoutSpans`. */
export type LogLayoutField = "level" | "module" | "message" | "emoji";

export type LogSpan = {
  text: string;
  role: LogSpanRole;
  tintKey?: string;
  chrome?: ChipChrome;
  /** Opaque kind label; used with symbolMap to build leading glyph. */
  kind?: string;
  /** When true, text is emitted as-is (no ANSI/CSS wrapping). */
  raw?: boolean;
  /** Session banner full-width row styling. */
  bannerChrome?: BannerChrome;
};

export type LogThemeId =
  | "solarized-dark"
  | "solarized-light"
  | "gruvbox-dark"
  | "gruvbox-light";

export type LogTheme = {
  id: string;
  levels: Partial<Record<LogLevelName, string>>;
  tintRamp: string[];
  roles?: Partial<Record<"module" | "message" | "meta" | "box" | "accent", string>>;
  background?: "dark" | "light";
};

export type Colorize = (id: string, defaultHex: string) => string;

/** App PII policy — transform log fields before write (parallel to {@link Colorize}). */
export type Redact = (fields: Record<string, unknown>) => Record<string, unknown>;

export type TintResolver = {
  resolve: (tintKey: string) => string | null;
};

export type ColumnDecorator = {
  decorate: (
    line: LogSpan[],
    ctx: { level: string; module: string; meta?: unknown },
  ) => LogSpan[];
};

export type PinoLogRecord = {
  level: number;
  msg?: string;
  module?: string;
  time?: number;
  [key: string]: unknown;
};

export type FormatRecordContext = {
  level: LogLevelName;
  module: string;
  defaultSpans: LogSpan[];
  options: CreateLoggerOptions;
};

/** Override pretty output for a pino NDJSON record (string = passthrough ANSI). */
export type FormatRecord = (
  record: PinoLogRecord,
  ctx: FormatRecordContext,
) => string | LogSpan[] | null | undefined;

export type ConsoleLeadingNewline =
  | boolean
  | ((record: Record<string, unknown>) => boolean);

export type ConsoleColorReset = "triple" | "none";

export type EventColumnSpec = {
  emojiWidth?: number;
  eventNameWidth?: number;
  identityToContentGap?: string;
  showEmoji?: boolean;
};

export type CreateLoggerOptions = {
  level?: LogLevelName | string;
  theme?: LogThemeId | LogTheme;
  themeOverrides?: Partial<LogTheme>;
  /**
   * Preset id (`default`, `classic`) or a `%level%` / `%module%` / `%message%` template.
   * See repo `layouts/README.md`.
   */
  layout?: string;
  /**
   * Event-only layout (`log.event` / `blancEvent`). May include a newline for row 2
   * (`%identity%`, `%meta%`, plus `%emoji%` / `%event%`). Preset: `identity-event`.
   */
  eventLayout?: string;
  /** Fixed display width for `%identity%` in `eventLayout` (: 24). */
  eventIdentityWidth?: number;
  colorize?: Colorize;
  /** Transform log fields before write (e.g. field-name PII policy). */
  redact?: Redact;
  tint?: TintResolver;
  columns?: ColumnDecorator;
  /** Replace or extend default level/module/message spans for a pino record. */
  formatRecord?: FormatRecord;
  /** Leading newline before each pretty line (e.g. console rhythm). */
  consoleLeadingNewline?: ConsoleLeadingNewline;
  /** Append background/foreground reset after each line (chip rows). */
  consoleColorReset?: ConsoleColorReset;
  /** Opaque kind → leading glyph (e.g. host → `/`). */
  symbolMap?: SymbolMap;
  /** Optional fixed columns on custom event rows (emoji slot, event name width). */
  eventColumns?: EventColumnSpec;
  plainStdout?: boolean;
  /** Emit ANSI even when `NO_COLOR` / non-TTY (dev terminals, worker pretty thread). */
  forceColor?: boolean;
  /** In-process pretty stream (no worker transport); use for tests or custom hooks. */
  syncPretty?: boolean;
  /** When using the worker pretty transport, flush each log synchronously (live NDJSON). */
  prettyTransportSync?: boolean;
  /**
   * Node pretty transport: after a line is formatted, return false to skip stdout
   * (e.g. MCP-primary hosts that still emit via a side channel).
   */
  consolePrettyDelivery?: (
    line: string,
    record: PinoLogRecord,
  ) => boolean;
};

export type BlancLogger = {
  pino: import("pino").Logger;
  child: (bindings: { module: string }) => BlancLogger;
  trace: (msg: string, fields?: object) => void;
  debug: (msg: string, fields?: object) => void;
  info: (msg: string, fields?: object) => void;
  warn: (msg: string, fields?: object) => void;
  error: (msg: string, fields?: object) => void;
  fatal: (msg: string, fields?: object) => void;
  event: (msg: string, fields?: object) => void;
};
