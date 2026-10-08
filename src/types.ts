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
export type LogLayoutField = "level" | "module" | "message" | "emoji" | "identity";

export type LogSpan = {
  text: string;
  role: LogSpanRole;
  tintKey?: string | undefined;
  chrome?: ChipChrome | undefined;
  /** Opaque kind label; used with symbolMap to build leading glyph. */
  kind?: string | undefined;
  /** When true, text is emitted as-is (no ANSI/CSS wrapping). */
  raw?: boolean | undefined;
  /** Full-width box row styling (`role: "banner"`). */
  bannerChrome?: BannerChrome | undefined;
};

export type LogThemeId =
  | "solarized-dark"
  | "solarized-light"
  | "gruvbox-dark"
  | "gruvbox-light"
  | "tokyo-night-dark"
  | "tokyo-night-light"
  | "dracula-dark"
  | "dracula-light"
  | "catppuccin-dark"
  | "catppuccin-light";

export type LogTheme = {
  id: string;
  levels: Partial<Record<LogLevelName, string>>;
  tintRamp: string[];
  roles?:
    | Partial<Record<"module" | "message" | "meta" | "box" | "accent", string>>
    | undefined;
  background?: "dark" | "light" | undefined;
};

export type Colorize = (id: string, defaultHex: string) => string;

/** App PII policy: transform log fields before write (parallel to {@link Colorize}). */
export type Redact = (fields: Record<string, unknown>) => Record<string, unknown>;

export type TintResolver = {
  resolve: (tintKey: string) => string | null;
};

export type ColumnDecorator = {
  decorate: (
    line: LogSpan[],
    ctx: { level: string; module: string; meta?: unknown | undefined },
  ) => LogSpan[];
};

export type PinoLogRecord = {
  level: number;
  msg?: string | undefined;
  module?: string | undefined;
  time?: number | undefined;
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

/** ANSI palette for Node pretty output (`auto` means truecolor). */
export type AnsiMode = "auto" | "truecolor" | "256" | "16";

export type ResolvedAnsiPalette = "truecolor" | "256" | "16";

export type EventColumnSpec = {
  emojiWidth?: number | undefined;
  eventNameWidth?: number | undefined;
  identityToContentGap?: string | undefined;
  showEmoji?: boolean | undefined;
};

/** NDJSON file sink (`pino/file`): separate level from console pretty. */
export type FileLogOptions = {
  path: string;
  level?: LogLevelName | string | undefined;
  mkdir?: boolean | undefined;
};

export type CreateLoggerOptions = {
  level?: LogLevelName | string | undefined;
  theme?: LogThemeId | LogTheme | undefined;
  themeOverrides?: Partial<LogTheme> | undefined;
  /**
   * Text preset id (`default`, `complex`, …) or a `%level%` / `%module%` / `%message%` template.
   * See `config/layout.yml`: `text.default` when omitted.
   */
  layout?: string | undefined;
  /**
   * Event-only layout (`log.event` / `pbEvent`). May include a newline for row 2
   * (`%identity%`, `%meta%`, plus `%emoji%` / `%event%`). Preset id or raw template.
   */
  eventLayout?: string | undefined;
  /** Fixed display width for `%identity%` in `eventLayout`. */
  eventIdentityWidth?: number | undefined;
  colorize?: Colorize | undefined;
  /** Transform log fields before write (e.g. PII redaction). */
  redact?: Redact | undefined;
  tint?: TintResolver | undefined;
  columns?: ColumnDecorator | undefined;
  /** Replace or extend default level/module/message spans for a pino record. */
  formatRecord?: FormatRecord | undefined;
  /** Leading newline before each pretty line (console rhythm). */
  consoleLeadingNewline?: ConsoleLeadingNewline | undefined;
  /** Append background/foreground reset after each line (chip rows). */
  consoleColorReset?: ConsoleColorReset | undefined;
  /** Opaque kind to leading glyph (e.g. host uses `/`). */
  symbolMap?: SymbolMap | undefined;
  /** Optional fixed columns on custom event rows (emoji slot, event name width). */
  eventColumns?: EventColumnSpec | undefined;
  plainStdout?: boolean | undefined;
  /** Emit ANSI even when `NO_COLOR` / non-TTY (dev terminals, worker pretty thread). */
  forceColor?: boolean | undefined;
  /** `auto` means truecolor (default); set `PINO_BLANC_ANSI=256` to quantize. */
  ansiMode?: AnsiMode | undefined;
  /** In-process pretty stream (no worker transport); use for tests or custom hooks. */
  syncPretty?: boolean | undefined;
  /** When using the worker pretty transport, flush each log synchronously (live NDJSON). */
  prettyTransportSync?: boolean | undefined;
  /**
   * Node pretty transport: after a line is formatted, return false to skip stdout
   * (e.g. MCP-primary hosts that still emit via a side channel).
   */
  consolePrettyDelivery?:
    | ((line: string, record: PinoLogRecord) => boolean)
    | undefined;
  /** Append NDJSON lines via `pino/file` (multi-target with pretty console). */
  file?: string | FileLogOptions | undefined;
  /** Pretty console stream (default `process.stdout`; use `process.stderr` for plain/MCP). */
  consoleDestination?: NodeJS.WritableStream | undefined;
};

export type PBLogger = {
  pino: import("pino").Logger;
  child: (bindings: { module: string }) => PBLogger;
  trace: (msg: string, fields?: object) => void;
  debug: (msg: string, fields?: object) => void;
  info: (msg: string, fields?: object) => void;
  warn: (msg: string, fields?: object) => void;
  error: (msg: string, fields?: object) => void;
  fatal: (msg: string, fields?: object) => void;
  event: (msg: string, fields?: object) => void;
};
