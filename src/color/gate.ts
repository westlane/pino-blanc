import { COLORFGBG_THEME_IDS } from "../defaults.js";
import type { AnsiMode, ResolvedAnsiPalette } from "../types.js";

export type PrettyColorOptions = {
  forceColor?: boolean;
  plainStdout?: boolean;
  ansiMode?: AnsiMode;
};

/** Pick palette: Cursor/VS Code often lacks COLORTERM → default 256, not 24-bit. */
export function resolveAnsiMode(
  options: Pick<PrettyColorOptions, "ansiMode"> = {},
): ResolvedAnsiPalette {
  const fromEnv = process.env.PINO_BLANC_ANSI?.trim().toLowerCase();
  if (fromEnv === "truecolor" || fromEnv === "24bit") {
    return "truecolor";
  }
  if (fromEnv === "256" || fromEnv === "8bit") {
    return "256";
  }
  if (fromEnv === "16" || fromEnv === "basic") {
    return "16";
  }
  const mode = options.ansiMode ?? "auto";
  if (mode === "truecolor" || mode === "256" || mode === "16") {
    return mode;
  }
  const ct = process.env.COLORTERM ?? "";
  if (ct === "truecolor" || ct === "24bit") {
    return "truecolor";
  }
  return "256";
}

/** Whether pretty formatters emit ANSI (independent of NDJSON `plainStdout`). */
export function resolvePrettyColor(
  options: PrettyColorOptions = {},
  plainTransport = false,
): boolean {
  if (plainTransport || options.plainStdout) {
    return false;
  }
  if (process.env.PINO_BLANC_PLAIN === "1") {
    return false;
  }
  if (options.forceColor === false) {
    return false;
  }
  if (process.env.PINO_BLANC_FORCE_COLOR === "0") {
    return false;
  }
  if (options.forceColor === true) {
    return true;
  }
  if (process.env.PINO_BLANC_FORCE_COLOR === "1") {
    return true;
  }
  if (supportsColors()) {
    return true;
  }
  // Pretty logger: ANSI by default (IDE terminals often set NO_COLOR / non-TTY).
  return true;
}

export function supportsColors(env: NodeJS.ProcessEnv = process.env): boolean {
  if (env.NO_COLOR !== undefined && env.NO_COLOR !== "") {
    return false;
  }
  if (env.FORCE_COLOR === "0") {
    return false;
  }
  if (env.FORCE_COLOR !== undefined && env.FORCE_COLOR !== "0") {
    return true;
  }
  if (!process.stdout?.isTTY) {
    return false;
  }
  const term = env.TERM ?? "";
  if (!term || term === "dumb" || term === "unknown") {
    return false;
  }
  return true;
}

export function resolveThemeIdFromEnv(
  env: NodeJS.ProcessEnv = process.env,
): string | undefined {
  const explicit = env.PINO_BLANC_THEME;
  if (explicit) {
    return explicit;
  }
  const fgBg = env.COLORFGBG ?? "";
  if (fgBg) {
    const bg = Number.parseInt(fgBg.split(";")[0] ?? "", 10);
    if (!Number.isNaN(bg) && bg >= 0 && bg <= 6) {
      return COLORFGBG_THEME_IDS.light;
    }
    if (!Number.isNaN(bg) && bg >= 8) {
      return COLORFGBG_THEME_IDS.dark;
    }
  }
  return undefined;
}
