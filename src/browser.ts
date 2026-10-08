export {
  createBrowserLogger,
  createBrowserLogger as createLogger,
} from "./browser/create.js";
export type {
  BlancLogger,
  ChipChrome,
  Colorize,
  Redact,
  ColumnDecorator,
  CreateLoggerOptions,
  LogLevelName,
  LogSpan,
  LogTheme,
  LogThemeId,
  SymbolMap,
  TintResolver,
} from "./types.js";
export { colorFromId } from "./color/id.js";
export {
  colorFromDid,
  didColorize,
  didColorSeed,
  generateColorFromString,
} from "./color/did.js";
export { resolveTheme, createTintResolver } from "./color/theme.js";
