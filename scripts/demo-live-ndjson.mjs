/**
 * Live NDJSON to pretty: `_liveReplace` ticks overwrite one block; a non-live
 * event commits the last frame into scrollback.
 *
 *   yarn demo:live
 *
 * Env:
 *   PINO_BLANC_THEME=solarized-dark
 *   PINO_BLANC_LIVE_TICKS=12
 *   PINO_BLANC_LIVE_INTERVAL_MS=180
 *   PINO_BLANC_DEMO_FORCE_COLOR=0
 */
import { existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

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
  const handle = process.stdout._handle;
  if (handle && typeof handle.setBlocking === "function") {
    handle.setBlocking(true);
  }
}

function flushStdout() {
  if (typeof process.stdout.flush === "function") {
    process.stdout.flush();
  }
}

prepareDemoTerminal();

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const entry = join(root, "dist/src/index.js");

if (!existsSync(entry)) {
  console.error("Run from package root after build: yarn demo:live");
  process.exit(1);
}

const { createLogger, renderBannerLine } = await import(entry);

const theme = process.env.PINO_BLANC_THEME?.trim() || "solarized-dark";
const ticks = Math.max(
  1,
  Number.parseInt(process.env.PINO_BLANC_LIVE_TICKS ?? "12", 10) || 12,
);
const intervalMs = Math.max(
  50,
  Number.parseInt(process.env.PINO_BLANC_LIVE_INTERVAL_MS ?? "180", 10) || 180,
);

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

process.stdout.write(
  `\n${renderBannerLine({ title: "pino-blanc", subtitle: "live" }, theme)}\n`,
);
flushStdout();

const log = createLogger("ndjson-peer", {
  theme,
  level: "debug",
  forceColor: true,
  syncPretty: true,
  prettyTransportSync: true,
});

for (let i = 0; i < ticks; i += 1) {
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

log.event("ws.batch_done", {
  _emoji: "✅",
  frames: ticks,
  durationMs: intervalMs * (ticks - 1),
});

log.pino.flush?.();
process.stdout.write("\n");
