import { existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const entry = join(root, "dist/src/index.js");

if (!existsSync(entry)) {
  console.error(
    "pino-blanc: run from the package root after build:\n" +
      "  cd path/to/pino-blanc && yarn demo:themes\n",
  );
  process.exit(1);
}

const {
  buildBoxSpans,
  colorFromId,
  createLogger,
  hashString,
  renderBannerLine,
  renderBoxBlock,
  resolveBoxBarWidth,
  resolveTheme,
  writeBoxToConsole,
} = await import(entry);

const SOLARIZED_RAMP_LABELS = [
  "blue",
  "cyan",
  "green",
  "yellow",
  "orange",
  "red",
  "violet",
  "magenta",
];

const ALL_THEMES = [
  "solarized-dark",
  "solarized-light",
  "gruvbox-dark",
  "gruvbox-light",
];

const fromEnv = process.env.PINO_BLANC_THEME?.trim();
const demoMode = process.env.PINO_BLANC_DEMO?.trim() || "all";

if (fromEnv && !ALL_THEMES.includes(fromEnv)) {
  console.error(
    `Unknown PINO_BLANC_THEME="${fromEnv}". Use one of: ${ALL_THEMES.join(", ")}`,
  );
  process.exit(1);
}

if (!["all", "solarized", "gruvbox"].includes(demoMode)) {
  console.error(
    `Unknown PINO_BLANC_DEMO="${demoMode}". Use: all, solarized, gruvbox`,
  );
  process.exit(1);
}

function themesToRun() {
  if (fromEnv) {
    return [fromEnv];
  }
  if (demoMode === "solarized") {
    return ["solarized-dark", "solarized-light"];
  }
  if (demoMode === "gruvbox") {
    return ["gruvbox-dark", "gruvbox-light"];
  }
  return ALL_THEMES;
}

/**  DID tint — defaults to theme `tintRamp` (full Solarized accent set). */
function didColorTransform(themeId) {
  const theme = resolveTheme(themeId);
  return (id, defaultHex) => {
    if (id.startsWith("did:")) {
      return colorFromId(id, theme.tintRamp);
    }
    return defaultHex;
  };
}

function moduleNameForRampIndex(theme, targetIndex) {
  const len = theme.tintRamp.length;
  for (let n = 0; n < 20_000; n += 1) {
    const mod = `ramp-${n}`;
    if (hashString(mod.toLowerCase()) % len === targetIndex) {
      return mod;
    }
  }
  return `ramp-${targetIndex}`;
}

const loggerOptions = {
  syncPretty: true,
  level: "trace",
  consoleLeadingNewline: true,
};

function runStandardLevels(log) {
  process.stdout.write("\n  standard levels\n");
  log.trace("trace — fine-grained detail", { step: 1 });
  log.debug("debug — diagnostic", { pid: process.pid });
  log.info("info — ready", { port: 3030 });
  log.warn("warn — slow query", { ms: 420 });
  log.error("error — request failed", { status: 500 });
  log.fatal("fatal — shutting down", { code: "EEXIT" });
}

function runEvents(log) {
  process.stdout.write("\n  events (log.event)\n");
  log.event("api.ready", { _emoji: "🚀" });
  log.event("user.signed_in", {
    _emoji: "✅",
    userId: "u_01",
    method: "passkey",
  });
  log.event("cache.miss", { _emoji: "📭", key: "session:abc", ttl: 0 });
}

function runSolarizedEvents(log) {
  process.stdout.write("\n  events — JSON roles (accent / meta / number)\n");
  log.event("host.catalog.discovered", {
    _emoji: "📡",
    total: 15,
    replicas: 15,
    stale: false,
  });
  log.event("network.ws.started", {
    _emoji: "🔌",
    path: "/ws/",
    port: 4000,
    secure: true,
  });
  log.event("locker.replicate.done", {
    _emoji: "💾",
    bytes: 1_048_576,
    durationMs: 128,
    ok: true,
  });
}

function runSolarizedModuleRamp(themeId) {
  const theme = resolveTheme(themeId);
  process.stdout.write(
    "\n  module tags — one line per Solarized tintRamp accent\n",
  );
  for (let i = 0; i < theme.tintRamp.length; i += 1) {
    const label = SOLARIZED_RAMP_LABELS[i] ?? `accent-${i}`;
    const mod = moduleNameForRampIndex(theme, i);
    const log = createLogger(mod, { ...loggerOptions, theme: themeId });
    log.info(`tintRamp ${label} (${theme.tintRamp[i]})`, { index: i });
  }
}

function runSolarizedLayouts(themeId) {
  process.stdout.write("\n  layouts — default vs complex\n");
  const msg = "same message, different column template";
  createLogger("layout-default", {
    ...loggerOptions,
    theme: themeId,
    layout: "default",
  }).info(msg);
  createLogger("layout-complex", {
    ...loggerOptions,
    theme: themeId,
    layout: "complex",
  }).info(msg);
}

function runBoxes(themeId, { extended = false } = {}) {
  process.stdout.write("\n  box.complex (content-width DID tint)\n");
  const boxOpts = {
    theme: themeId,
    colorize: didColorTransform(themeId),
    consoleColorReset: "triple",
  };

  const identities = extended
    ? [
        {
          alias: "@demo-user",
          did: "did:user:z6MkDemoBox",
          chrome: "inverted",
        },
        {
          alias: "/energetic-domehut-y5Yk",
          did: "did:locker:energetic-domehut-y5Yk",
          chrome: "inverted",
        },
        {
          alias: "@lucky-aphid",
          did: "did:user:z6Mkluckyaphid",
          chrome: "faint",
        },
        {
          alias: "@host-replica",
          did: "did:locker:z6MkHostReplica",
          chrome: "fill",
        },
      ]
    : [
        {
          alias: "@demo-user",
          did: "did:user:z6MkDemoBox",
          chrome: "inverted",
        },
      ];

  if (!extended) {
    for (const chrome of ["inverted", "faint", "fill"]) {
      const appLine = "pino-blanc v0.1.0 - info level";
      const aliasLine = "@demo-user";
      const spans = buildBoxSpans({
        appLine,
        aliasLine,
        barWidth: resolveBoxBarWidth(appLine, aliasLine),
        identityTintKey: "did:user:z6MkDemoBox",
        identityChrome: chrome,
      });
      writeBoxToConsole(renderBoxBlock(spans, boxOpts));
    }
    return;
  }

  const appLine = "pino-blanc demo — solarized identity chrome";
  for (const { alias, did, chrome } of identities) {
    const spans = buildBoxSpans({
      appLine,
      aliasLine: alias,
      barWidth: resolveBoxBarWidth(appLine, alias),
      identityTintKey: did,
      identityChrome: chrome,
    });
    writeBoxToConsole(renderBoxBlock(spans, boxOpts));
  }
}

function runThemeBlock(themeId) {
  const isSolarized = themeId.startsWith("solarized-");
  process.stdout.write(
    `\n${renderBannerLine(`theme: ${themeId}`, themeId)}\n`,
  );
  const log = createLogger("demo", { ...loggerOptions, theme: themeId });

  runStandardLevels(log);
  runEvents(log);
  if (isSolarized) {
    runSolarizedModuleRamp(themeId);
    runSolarizedEvents(log);
    runSolarizedLayouts(themeId);
  }
  runBoxes(themeId, { extended: isSolarized });
}

for (const theme of themesToRun()) {
  runThemeBlock(theme);
}

process.stdout.write("\n");
