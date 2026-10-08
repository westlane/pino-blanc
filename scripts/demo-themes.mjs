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

function writeBox(title, subtitle, themeId) {
  process.stdout.write(
    `\n${renderBannerLine({ title, subtitle }, themeId)}\n`,
  );
}

function runStandardLevels(log, themeId) {
  writeBox("levels", "all", themeId);
  log.trace("trace", { step: 1 });
  log.debug("debug", { pid: process.pid });
  log.info("ready", { port: 3030 });
  log.warn("slow", { ms: 420 });
  log.error("failed", { status: 500 });
  log.fatal("exit", { code: "EEXIT" });
}

function runEvents(log, themeId) {
  writeBox("events", "log.event", themeId);
  log.event("api.ready", { _emoji: "🚀" });
  log.event("user.signed_in", {
    _emoji: "✅",
    userId: "u_01",
    method: "passkey",
  });
  log.event("cache.miss", { _emoji: "📭", key: "session:abc", ttl: 0 });
}

function runSolarizedEvents(log, themeId) {
  writeBox("events", "json", themeId);
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
  writeBox("modules", "tintRamp", themeId);
  const theme = resolveTheme(themeId);
  for (let i = 0; i < theme.tintRamp.length; i += 1) {
    const label = SOLARIZED_RAMP_LABELS[i] ?? `accent-${i}`;
    const mod = moduleNameForRampIndex(theme, i);
    const log = createLogger(mod, { ...loggerOptions, theme: themeId });
    log.info(label, { index: i, hex: theme.tintRamp[i] });
  }
}

function runSolarizedLayouts(themeId) {
  writeBox("layouts", "default / complex", themeId);
  const msg = "hello";
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
  writeBox("box", "complex", themeId);
  const boxOpts = {
    theme: themeId,
    colorize: didColorTransform(themeId),
    consoleColorReset: "triple",
  };

  const identities = extended
    ? [
        { subtitle: "@demo-user", did: "did:user:z6MkDemoBox", chrome: "inverted" },
        {
          subtitle: "/energetic-domehut-y5Yk",
          did: "did:locker:energetic-domehut-y5Yk",
          chrome: "inverted",
        },
        { subtitle: "@lucky-aphid", did: "did:user:z6Mkluckyaphid", chrome: "faint" },
        { subtitle: "@host-replica", did: "did:locker:z6MkHostReplica", chrome: "fill" },
      ]
    : [
        { subtitle: "@demo-user", did: "did:user:z6MkDemoBox", chrome: "inverted" },
      ];

  const chromes = extended
    ? identities
    : ["inverted", "faint", "fill"].map((chrome) => ({
        subtitle: "@demo-user",
        did: "did:user:z6MkDemoBox",
        chrome,
      }));

  for (const { subtitle, did, chrome } of chromes) {
    const spans = buildBoxSpans({
      boxLayout: "complex",
      title: "pino-blanc",
      version: "0.1.0",
      level: "info",
      subtitle,
      identityTintKey: did,
      identityChrome: chrome,
    });
    writeBoxToConsole(renderBoxBlock(spans, boxOpts));
  }
}

function runThemeBlock(themeId) {
  const isSolarized = themeId.startsWith("solarized-");
  writeBox("pino-blanc", themeId, themeId);
  const log = createLogger("demo", { ...loggerOptions, theme: themeId });

  runStandardLevels(log, themeId);
  runEvents(log, themeId);
  if (isSolarized) {
    runSolarizedModuleRamp(themeId);
    runSolarizedEvents(log, themeId);
    runSolarizedLayouts(themeId);
  }
  runBoxes(themeId, { extended: isSolarized });
}

for (const theme of themesToRun()) {
  runThemeBlock(theme);
}

process.stdout.write("\n");
