import { centerInBar } from "./center-bar.js";
import { resolveBoxLayout } from "./box-presets.js";

/** Center text in the active box preset width (`box.default`). */
export function formatBoxLine(text: string, width?: number): string {
  const preset = resolveBoxLayout();
  const w = Math.max(preset.minInner, width ?? preset.width);
  if (!text) {
    return " ".repeat(w);
  }
  return centerInBar(text, w);
}
