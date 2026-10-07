import type { ColorTransform, LogTheme, LogThemeId, TintResolver } from "../types.js";
import { colorFromId } from "./id.js";
import { ink } from "../../themes/ink.js";
import { solarizedDark } from "../../themes/solarized-dark.js";
import { solarizedLight } from "../../themes/solarized-light.js";
import { resolveThemeIdFromEnv } from "./gate.js";

const BUILT_IN: Record<string, LogTheme> = {
  "solarized-dark": solarizedDark,
  "solarized-light": solarizedLight,
  ink,
};

export function resolveTheme(
  theme?: LogThemeId | LogTheme,
  overrides?: Partial<LogTheme>,
): LogTheme {
  let base: LogTheme;
  if (!theme) {
    const fromEnv = resolveThemeIdFromEnv();
    base = BUILT_IN[fromEnv ?? "solarized-dark"] ?? solarizedDark;
  } else if (typeof theme === "string") {
    base = BUILT_IN[theme] ?? solarizedDark;
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
  colorTransform?: ColorTransform,
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
      return colorTransform ? colorTransform(tintKey, base) : base;
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
