import { centerInBar } from "./center-bar.js";
import { box } from "./layout.data.js";
import { displayWidth } from "./width.js";

const BOX_TRUNCATE_ELLIPSIS = "...";

/** Center text in the active box preset width (`box.default`). */
export function formatBoxLine(text: string, width = box.width): string {
  const w = Math.max(box.minInner, width);
  if (!text) {
    return " ".repeat(w);
  }
  let display = text;
  if (displayWidth(display) > w) {
    const max = Math.max(0, w - BOX_TRUNCATE_ELLIPSIS.length);
    display = `${display.slice(0, max)}${BOX_TRUNCATE_ELLIPSIS}`;
  }
  return centerInBar(display, w);
}
