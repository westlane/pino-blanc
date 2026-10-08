/**
 * Live NDJSON → pretty: same pipeline as production Pino transports.
 *
 *   yarn demo:live
 *
 * Env:
 *   PINO_BLANC_THEME=solarized-dark
 *   PINO_BLANC_LIVE_TICKS=12        — simulated WS messages (default 12)
 *   PINO_BLANC_LIVE_INTERVAL_MS=180 — delay between messages
 *   PINO_BLANC_LIVE_MODE=all|transport|peer|createLogger  (default all)
 *   PINO_BLANC_DEMO_FORCE_COLOR=0   — respect NO_COLOR / plain (default: force ANSI for demos)
 */
import { spawn } from "node:child_process";
import { once } from "node:events";
import { existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import pino from "pino";

const BLANC_EVENT_KEY = "blancEvent";

/** Cursor / CI often set NO_COLOR — demos still need tintRamp + JSON roles visible. */
function prepareDemoTerminal() {
  const force =
    process.env.PINO_BLANC_DEMO_FORCE_COLOR !== "0" &&
    process.env.PINO_BLANC_DEMO_PLAIN !== "1";
  if (force) {
    delete process.env.NO_COLOR;
    process.env.FORCE_COLOR = "1";
    if (!process.env.TERM || process.env.TERM === "dumb") {
      process.env.TERM = "xterm-256color";
    }
  }
  const out = process.stdout;
  const handle = out._handle;
  if (handle && typeof handle.setBlocking === "function") {
    handle.setBlocking(true);
  }
}

function flushStdout() {
  const out = process.stdout;
  if (typeof out.flush === "function") {
    out.flush();
  }
}

prepareDemoTerminal();

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const entry = join(root, "dist/src/index.js");
const prettyEntry = join(root, "dist/src/node/transport/pretty.js");

if (!existsSync(entry) || !existsSync(prettyEntry)) {
  console.error("Run from package root after build: yarn demo:live");
  process.exit(1);
}

const { createLogger, renderBannerLine } = await import(entry);
const buildPrettyStream = (await import(prettyEntry)).default;

const theme = process.env.PINO_BLANC_THEME?.trim() || "solarized-dark";
const ticks = Math.max(
  1,
  Number.parseInt(process.env.PINO_BLANC_LIVE_TICKS ?? "12", 10) || 12,
);
const intervalMs = Math.max(
  50,
  Number.parseInt(process.env.PINO_BLANC_LIVE_INTERVAL_MS ?? "180", 10) ||
    180,
);
const mode = process.env.PINO_BLANC_LIVE_MODE?.trim() || "all";

if (!["all", "transport", "peer", "createLogger"].includes(mode)) {
  console.error(
    `Unknown PINO_BLANC_LIVE_MODE="${mode}". Use: all, transport, peer, createLogger`,
  );
  process.exit(1);
}

const blancOpts = {
  theme,
  consoleLeadingNewline: true,
  level: "debug",
  forceColor: true,
};

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function simulateWebSocketFeed(log, label) {
  process.stdout.write(
    `\n${renderBannerLine(`${label} — live NDJSON stream`, theme)}\n`,
  );
  process.stdout.write(
    `  emitting ${ticks} ws.frame events every ${intervalMs}ms\n`,
  );

  for (let i = 0; i < ticks; i += 1) {
    // `_liveReplace` rewrites the same terminal block each tick (not scrollback spam).
    log.event("ws.frame", {
      _emoji: "📨",
      _liveReplace: true,
      seq: i + 1,
      bytes: 64 + i * 17,
      path: "/ws/",
    });
    flushStdout();
    if (i < ticks - 1) {
      await sleep(intervalMs);
    }
  }

  // Non-live event commits the last frame into history, then appends done.
  log.event("ws.batch_done", {
    _emoji: "✅",
    frames: ticks,
    durationMs: intervalMs * (ticks - 1),
  });
}

function workerEnvForDemo() {
  const env = { ...process.env };
  if (process.env.PINO_BLANC_DEMO_FORCE_COLOR !== "0") {
    delete env.NO_COLOR;
    env.FORCE_COLOR = env.FORCE_COLOR || "1";
    env.TERM = env.TERM || "xterm-256color";
  }
  return env;
}

/**
 * Real `pino.transport` worker thread (no `consoleLeadingNewline` — that
 * forces in-process pretty via `createLogger`).
 */
async function runTransportMode() {
  const transport = pino.transport({
    target: prettyEntry,
    options: {
      options: { theme, level: "debug", forceColor: true },
    },
    sync: true,
    worker: { env: workerEnvForDemo() },
  });
  await once(transport, "ready");

  const raw = pino(
    {
      level: "debug",
      base: { module: "gateway" },
      timestamp: pino.stdTimeFunctions.isoTime,
    },
    transport,
  );

  const log = {
    event: (msg, meta) =>
      raw.info({ ...meta, [BLANC_EVENT_KEY]: true }, msg),
  };

  await simulateWebSocketFeed(log, "pino.transport (worker thread)");
  raw.flush();
  await sleep(200);
}

/** `createLogger` in-process pretty ( `consoleLeadingNewline`). */
async function runPeerMode() {
  const log = createLogger("ndjson-peer", {
    ...blancOpts,
    syncPretty: true,
    prettyTransportSync: true,
  });
  await simulateWebSocketFeed(
    log,
    "createLogger (in-process pretty, syncPretty)",
  );
  log.pino.flush?.();
  await sleep(200);
}

/** pino(logger) → Writable pretty stream (NDJSON peer / tail -f style). */
async function runPeerWritableMode() {
  const pretty = buildPrettyStream({
    options: blancOpts,
  });
  const raw = pino(
    {
      level: "debug",
      base: { module: "ndjson-peer" },
      timestamp: pino.stdTimeFunctions.isoTime,
      sync: true,
    },
    pretty,
  );

  const log = {
    event: (msg, meta) =>
      raw.info({ ...meta, blancEvent: true, module: "ndjson-peer" }, msg),
  };

  await simulateWebSocketFeed(log, "pino → pretty Writable (sync)");
  await sleep(200);
}

/** Pipe pure NDJSON stdout from a child into this process's pretty transport. */
async function runPipeMode() {
  process.stdout.write(
    `\n${renderBannerLine("shell pipe — NDJSON producer | pretty consumer", theme)}\n`,
  );

  const producer = `
import pino from 'pino';
const log = pino({ level: 'info', base: { module: 'pipe-producer' } });
for (let i = 0; i < ${ticks}; i++) {
  log.info({ seq: i + 1, tick: Date.now() }, 'pipe.tick');
  await new Promise((r) => setTimeout(r, ${intervalMs}));
}
`;

  await new Promise((resolve, reject) => {
    const child = spawn(process.execPath, ["--input-type=module", "-e", producer], {
      cwd: root,
      stdio: ["ignore", "pipe", "inherit"],
    });

    const pretty = buildPrettyStream({
      options: { ...blancOpts, theme },
    });

    child.stdout.pipe(pretty);

    child.on("error", reject);
    child.on("close", (code) => {
      if (code !== 0) {
        reject(new Error(`producer exited ${code}`));
        return;
      }
      setTimeout(resolve, 150);
    });
  });
}

process.stdout.write(
  `\n${renderBannerLine("pino-blanc live NDJSON demo", theme)}\n`,
);
flushStdout();

if (mode === "transport" || mode === "all") {
  await runTransportMode();
}
if (mode === "createLogger" || mode === "all") {
  await runPeerMode();
}
if (mode === "peer" || mode === "all") {
  await runPeerWritableMode();
}
if (mode === "all") {
  await runPipeMode();
}

process.stdout.write("\n");
