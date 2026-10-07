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
  | "accent";

export type LogSpan = {
  text: string;
  role: LogSpanRole;
  tintKey?: string;
};

export type LogThemeId = "solarized-dark" | "solarized-light" | "ink";

export type LogTheme = {
  id: string;
  levels: Partial<Record<LogLevelName, string>>;
  tintRamp: string[];
  roles?: Partial<Record<"module" | "message" | "meta" | "box" | "accent", string>>;
  background?: "dark" | "light";
};

export type ColorTransform = (id: string, defaultHex: string) => string;

export type TintResolver = {
  resolve: (tintKey: string) => string | null;
};

export type ColumnDecorator = {
  decorate: (
    line: LogSpan[],
    ctx: { level: string; module: string; meta?: unknown },
  ) => LogSpan[];
};

export type CreateLoggerOptions = {
  level?: LogLevelName | string;
  theme?: LogThemeId | LogTheme;
  themeOverrides?: Partial<LogTheme>;
  colorTransform?: ColorTransform;
  tint?: TintResolver;
  columns?: ColumnDecorator;
  plainStdout?: boolean;
};

export type BlancLogger = {
  pino: import("pino").Logger;
  child: (bindings: { module: string }) => BlancLogger;
  trace: (msg: string, meta?: object) => void;
  debug: (msg: string, meta?: object) => void;
  info: (msg: string, meta?: object) => void;
  warn: (msg: string, meta?: object) => void;
  error: (msg: string, meta?: object) => void;
  fatal: (msg: string, meta?: object) => void;
  event: (msg: string, meta?: object) => void;
};
