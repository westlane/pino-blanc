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
  "tokyo-night-dark",
  "tokyo-night-light",
  "dracula-dark",
  "dracula-light",
  "catppuccin-dark",
  "catppuccin-light",
];

const fromEnv = process.env.PINO_BLANC_THEME?.trim();
const demoMode = process.env.PINO_BLANC_DEMO?.trim() || "all";

if (fromEnv && !ALL_THEMES.includes(fromEnv)) {
  console.error(
    `Unknown PINO_BLANC_THEME="${fromEnv}". Use one of: ${ALL_THEMES.join(", ")}`,
  );
  process.exit(1);
}

const DEMO_MODES = [
  "all",
  "solarized",
  "gruvbox",
  "tokyo-night",
  "dracula",
  "catppuccin",
  "identity",
];

if (!DEMO_MODES.includes(demoMode)) {
  console.error(
    `Unknown PINO_BLANC_DEMO="${demoMode}". Use: ${DEMO_MODES.join(", ")}`,
  );
  process.exit(1);
}

function themesToRun() {
  if (fromEnv) {
    return [fromEnv];
  }
  if (demoMode === "solarized" || demoMode === "identity") {
    return ["solarized-dark", "solarized-light"];
  }
  if (demoMode === "gruvbox") {
    return ["gruvbox-dark", "gruvbox-light"];
  }
  if (demoMode === "tokyo-night") {
    return ["tokyo-night-dark", "tokyo-night-light"];
  }
  if (demoMode === "dracula") {
    return ["dracula-dark", "dracula-light"];
  }
  if (demoMode === "catppuccin") {
    return ["catppuccin-dark", "catppuccin-light"];
  }
  return ALL_THEMES;
}

/** Kind to log prefix glyph. */
const IDENTITY_SYMBOL_MAP = {
  host: "/",
  user: "@",
  locker: "_",
  agent: "%",
};

/** Real Rally host DID: same seed as live `/energetic-domehut-y5Yk` chips (#956cb3). */
const HOST_DID =
  "did:host:z7r8oppFnzGRygj2ZYeqJKs3NpEqgtva8tvAX1j8sFsPWygjqvapBhvor1uJE1kpaWmhBCCsJpqC6SnomTZ7tM3tAy5Yk";

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

/** Event rows with `%id%` chips: host / user / locker + chrome variants. */
function runIdentityEvents(themeId) {
  writeBox("identity", "event.complex", themeId);
  const log = createLogger("identity", {
    ...loggerOptions,
    theme: themeId,
    eventLayout: "complex",
    symbolMap: IDENTITY_SYMBOL_MAP,
  });

  // Event-column IDs: blanc `fill` = white glyph box + 25% tinted body
  // (session banners stay inverted separately). Host tint = HOST_DID is #956cb3.
  const samples = [
    {
      event: "host.catalog.discovered",
      kind: "host",
      body: "energetic-domehut-y5Yk",
      did: HOST_DID,
      chrome: "fill",
      meta: { total: 15, replicas: 15 },
    },
    {
      event: "host.identity.ready",
      kind: "host",
      body: "energetic-domehut-y5Yk",
      did: HOST_DID,
      chrome: "fill",
      meta: { slug: "energetic-domehut-y5Yk", success: true },
    },
    {
      event: "network.ws.connected",
      kind: "user",
      body: "lucky-aphid-2doK",
      did: "did:user:z6MksbDemoSeedPadForColor5i5",
      chrome: "fill",
      meta: { client: "chrome", path: "/ws/" },
    },
    {
      event: "locker.document.loaded",
      kind: "locker",
      body: "polished-cusp-nqN",
      did: "did:locker:z6Mk4ivDemoSeedPadForColorvo1",
      chrome: "fill",
      meta: { bytes: 92_461 },
    },
    {
      event: "locker.replicate.done",
      kind: "locker",
      body: "generous-creekbed",
      did: "did:locker:z6Mk1h9DemoSeedPadForColoracr",
      chrome: "fill",
      meta: { bytes: 1_048_576, ok: true },
    },
    {
      event: "agent.task.started",
      kind: "agent",
      body: "brisk-copper-bot",
      did: "did:agent:z6MkbtmDemoSeedPadForColor2ara",
      chrome: "fill",
      meta: { task: "index" },
    },
  ];

  for (const sample of samples) {
    log.event(sample.event, {
      _identityKind: sample.kind,
      _identityBody: sample.body,
      _identityTintKey: sample.did,
      _identityChrome: sample.chrome,
      ...sample.meta,
    });
  }
}

function runBoxes(themeId, { extended = false } = {}) {
  writeBox("box", "complex", themeId);
  const boxOpts = {
    theme: themeId,
    consoleColorReset: "triple",
  };

  const identities = extended
    ? [
        { subtitle: "@demo-user", did: "did:user:z6MkDemoBox", chrome: "inverted" },
        {
          subtitle: "/energetic-domehut-y5Yk",
          did: HOST_DID,
          chrome: "inverted",
        },
        { subtitle: "@lucky-aphid", did: "did:user:z6MksbDemoSeedPadForColor5i5", chrome: "faint" },
        { subtitle: "@host-replica", did: "did:locker:z6Mk1h9DemoSeedPadForColoracr", chrome: "fill" },
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
  const identityOnly = demoMode === "identity";
  writeBox("pino-blanc", themeId, themeId);
  const log = createLogger("demo", { ...loggerOptions, theme: themeId });

  if (identityOnly) {
    runIdentityEvents(themeId);
    runBoxes(themeId, { extended: true });
    return;
  }

  runStandardLevels(log, themeId);
  runEvents(log, themeId);
  if (isSolarized) {
    runSolarizedModuleRamp(themeId);
    runSolarizedEvents(log, themeId);
    runSolarizedLayouts(themeId);
    runIdentityEvents(themeId);
  }
  runBoxes(themeId, { extended: isSolarized });
}

for (const theme of themesToRun()) {
  runThemeBlock(theme);
}

process.stdout.write("\n");
