import { displayWidth } from "./width.js";

const BOX_TRUNCATE_ELLIPSIS = "...";

/** Truncate to `barWidth` display columns (ellipsis when needed). */
export function truncateToBarWidth(text: string, barWidth: number): string {
  if (barWidth <= 0) {
    return "";
  }
  if (displayWidth(text) <= barWidth) {
    return text;
  }
  const max = Math.max(0, barWidth - BOX_TRUNCATE_ELLIPSIS.length);
  let out = "";
  for (const ch of text) {
    if (displayWidth(out + ch) > max) {
      break;
    }
    out += ch;
  }
  return `${out}${BOX_TRUNCATE_ELLIPSIS}`;
}

/** Center plain text in a fixed display-width bar (`box` bands). Truncates to width. */
export function centerInBar(text: string, barWidth: number): string {
  const display = truncateToBarWidth(text, barWidth);
  const w = displayWidth(display);
  const left = Math.max(0, Math.floor((barWidth - w) / 2));
  const right = Math.max(0, barWidth - w - left);
  return `${" ".repeat(left)}${display}${" ".repeat(right)}`;
}
