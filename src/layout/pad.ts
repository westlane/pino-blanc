import { displayWidth } from "./width.js";

export function padEndDisplay(text: string, width: number): string {
  const cur = displayWidth(text);
  if (cur >= width) {
    return text;
  }
  return text + " ".repeat(width - cur);
}

export function padStartDisplay(text: string, width: number): string {
  const cur = displayWidth(text);
  if (cur >= width) {
    return text;
  }
  return " ".repeat(width - cur) + text;
}
