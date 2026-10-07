import { displayWidth } from "./width.js";

/** Center plain text in a fixed display-width bar (session banners). */
export function centerInBar(text: string, barWidth: number): string {
  const w = displayWidth(text);
  const left = Math.max(0, Math.floor((barWidth - w) / 2));
  const right = Math.max(0, barWidth - w - left);
  return `${" ".repeat(left)}${text}${" ".repeat(right)}`;
}
