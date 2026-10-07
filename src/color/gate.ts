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
  if (!process.stdout.isTTY) {
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
