export type PrettyColorOptions = {
  forceColor?: boolean;
  plainStdout?: boolean;
};

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
      return "solarized-light";
    }
    if (!Number.isNaN(bg) && bg >= 8) {
      return "solarized-dark";
    }
  }
  return undefined;
}
