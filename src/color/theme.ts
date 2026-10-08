import { DEFAULT_THEME_ID } from "../defaults.js";
import type { Colorize, LogTheme, LogThemeId, TintResolver } from "../types.js";
import {
  BUILT_IN_THEMES,
  builtInThemeIds as listBuiltInThemeIds,
  solarizedDark,
} from "../../themes/index.js";
import { didColorize } from "./did.js";
import { colorFromId } from "./id.js";
import { resolveThemeIdFromEnv } from "./gate.js";

const FALLBACK_THEME: LogTheme = solarizedDark;

export function resolveTheme(
  theme?: LogThemeId | LogTheme,
  overrides?: Partial<LogTheme>,
): LogTheme {
  let base: LogTheme;
  if (!theme) {
    const fromEnv = resolveThemeIdFromEnv();
    const id = fromEnv ?? DEFAULT_THEME_ID;
    base = BUILT_IN_THEMES[id] ?? FALLBACK_THEME;
  } else if (typeof theme === "string") {
    base = BUILT_IN_THEMES[theme] ?? FALLBACK_THEME;
  } else {
    base = theme;
  }
  if (!overrides) {
    return base;
  }
  return {
    ...base,
    ...overrides,
    levels: { ...base.levels, ...overrides.levels },
    roles: { ...base.roles, ...overrides.roles },
    tintRamp: overrides.tintRamp ?? base.tintRamp,
  };
}

export function createTintResolver(
  theme: LogTheme,
  colorize?: Colorize,
  custom?: TintResolver,
): TintResolver {
  const resolveColorize = colorize ?? didColorize;
  return {
    resolve(tintKey: string): string | null {
      if (custom) {
        const c = custom.resolve(tintKey);
        if (c) {
          return c;
        }
      }
      const base = colorFromId(tintKey, theme.tintRamp);
      return resolveColorize(tintKey, base);
    },
  };
}

export function levelHex(
  theme: LogTheme,
  level: string,
): string | undefined {
  const key = level.toLowerCase() as keyof typeof theme.levels;
  return theme.levels[key];
}

export function roleHex(
  theme: LogTheme,
  role: string,
): string | undefined {
  return theme.roles?.[role as keyof NonNullable<LogTheme["roles"]>];
}

export function builtInThemeIds(): string[] {
  return listBuiltInThemeIds();
}
