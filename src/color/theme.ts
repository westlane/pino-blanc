import { DEFAULT_THEME_ID } from "../defaults.js";
import type { Colorize, LogTheme, LogThemeId, TintResolver } from "../types.js";
import { BUILT_IN_THEMES, builtInThemeIds as listBuiltInThemeIds } from "../../themes/index.js";
import { colorFromId } from "./id.js";
import { resolveThemeIdFromEnv } from "./gate.js";

const FALLBACK_THEME =
  BUILT_IN_THEMES[DEFAULT_THEME_ID] ?? BUILT_IN_THEMES["solarized-dark"];

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
  return {
    resolve(tintKey: string): string | null {
      if (custom) {
        const c = custom.resolve(tintKey);
        if (c) {
          return c;
        }
      }
      const base = colorFromId(tintKey, theme.tintRamp);
      return colorize ? colorize(tintKey, base) : base;
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
