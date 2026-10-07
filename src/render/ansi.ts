import { wrapAnsi } from "../color/ansi.js";
import { levelHex, roleHex } from "../color/theme.js";
import { supportsColors } from "../color/gate.js";
import type { LogSpan, LogTheme, TintResolver } from "../types.js";
import { renderPlain } from "./plain.js";

export function renderAnsi(
  spans: LogSpan[],
  theme: LogTheme,
  tint: TintResolver,
  level: string,
  useColor = supportsColors(),
): string {
  if (!useColor) {
    return renderPlain(spans);
  }
  return spans
    .map((span) => {
      let hex: string | undefined;
      if (span.tintKey) {
        hex = tint.resolve(span.tintKey) ?? undefined;
      } else if (span.role === "level") {
        hex = levelHex(theme, level.trim().toLowerCase());
      } else {
        hex = roleHex(theme, span.role);
      }
      return wrapAnsi(span.text, hex);
    })
    .join("");
}
