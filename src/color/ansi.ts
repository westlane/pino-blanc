import type { AnsiMode } from "../types.js";
import { resolveAnsiMode } from "./gate.js";

export const ANSI_RESET = "\u001B[0m";

function parseRgb(hex: string): { r: number; g: number; b: number } | null {
  const clean = hex.replace(/^#/, "");
  if (clean.length < 6) {
    return null;
  }
  const r = Number.parseInt(clean.slice(0, 2), 16);
  const g = Number.parseInt(clean.slice(2, 4), 16);
  const b = Number.parseInt(clean.slice(4, 6), 16);
  if (Number.isNaN(r) || Number.isNaN(g) || Number.isNaN(b)) {
    return null;
  }
  return { r, g, b };
}

function rgbToAnsi256(r: number, g: number, b: number): number {
  if (r === g && g === b) {
    if (r < 8) {
      return 16;
    }
    if (r > 248) {
      return 231;
    }
    return Math.round(((r - 8) / 247) * 24) + 232;
  }
  return (
    16 +
    36 * Math.round((r / 255) * 5) +
    6 * Math.round((g / 255) * 5) +
    Math.round((b / 255) * 5)
  );
}

const BASIC_FG: number[] = [30, 31, 32, 33, 34, 35, 36, 37];

function rgbToBasicFg(r: number, g: number, b: number): number {
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  if (max - min < 20) {
    return max > 180 ? 37 : 30;
  }
  if (r >= g && r >= b) {
    return 31;
  }
  if (g >= r && g >= b) {
    return 32;
  }
  if (b >= r && b >= g) {
    return 34;
  }
  if (r > 200 && g > 200) {
    return 33;
  }
  return BASIC_FG[(r + g + b) % BASIC_FG.length];
}

export function hexToAnsiFg(
  hex: string,
  bold = false,
  mode: AnsiMode = "truecolor",
): string {
  const rgb = parseRgb(hex);
  if (!rgb) {
    return "";
  }
  const weight = bold ? "1;" : "";
  const resolved = resolveAnsiMode({ ansiMode: mode });
  if (resolved === "16") {
    return `\u001B[${weight}${rgbToBasicFg(rgb.r, rgb.g, rgb.b)}m`;
  }
  if (resolved === "256") {
    const idx = rgbToAnsi256(rgb.r, rgb.g, rgb.b);
    return `\u001B[${weight}38;5;${idx}m`;
  }
  return `\u001B[${weight}38;2;${rgb.r};${rgb.g};${rgb.b}m`;
}

export function hexToAnsiBg(
  hex: string,
  bold = false,
  mode: AnsiMode = "truecolor",
): string {
  const rgb = parseRgb(hex);
  if (!rgb) {
    return "";
  }
  const weight = bold ? "1;" : "";
  const resolved = resolveAnsiMode({ ansiMode: mode });
  if (resolved === "16") {
    return `\u001B[${weight}47m`;
  }
  if (resolved === "256") {
    const idx = rgbToAnsi256(rgb.r, rgb.g, rgb.b);
    return `\u001B[${weight}48;5;${idx}m`;
  }
  return `\u001B[${weight}48;2;${rgb.r};${rgb.g};${rgb.b}m`;
}

export function wrapAnsi(
  text: string,
  hex: string | undefined,
  mode: AnsiMode = "truecolor",
): string {
  if (!hex) {
    return text;
  }
  const open = hexToAnsiFg(hex, false, mode);
  if (!open) {
    return text;
  }
  return `${open}${text}${ANSI_RESET}`;
}

export function wrapAnsiChrome(
  text: string,
  background: string,
  foreground: string,
  bold = false,
  mode: AnsiMode = "truecolor",
): string {
  const bg = hexToAnsiBg(background, bold, mode);
  const fg = hexToAnsiFg(foreground, bold, mode);
  if (!bg || !fg) {
    return text;
  }
  return `${bg}${fg}${text}\u001B[49m\u001B[39m${ANSI_RESET}`;
}
