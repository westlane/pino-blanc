import { hexToCssFg } from "../color/css.js";
import { levelHex, roleHex } from "../color/theme.js";
import type { LogSpan, LogTheme, TintResolver } from "../types.js";

export type CssConsolePayload = {
  text: string;
  styles: string[];
};

export function renderCss(
  spans: LogSpan[],
  theme: LogTheme,
  tint: TintResolver,
  level: string,
): CssConsolePayload {
  let text = "";
  const styles: string[] = [""];
  for (const span of spans) {
    let hex: string | undefined;
    if (span.tintKey) {
      hex = tint.resolve(span.tintKey) ?? undefined;
    } else if (span.role === "level") {
      hex = levelHex(theme, level.trim().toLowerCase());
    } else {
      hex = roleHex(theme, span.role);
    }
    const css = hex ? hexToCssFg(hex) : "";
    text += `%c${span.text}`;
    styles.push(css);
  }
  return { text, styles };
}
