/**
 * Render docs/features.gif — wine-shop visit story across themes
 * (levels, live progress, live JSON, events, identity chips, boxes).
 *
 * Usage (from package root, after build):
 *   yarn demo:gif
 */
import { createWriteStream, existsSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { createCanvas, GlobalFonts } from "@napi-rs/canvas";
import gifenc from "gifenc";

const { GIFEncoder, quantize, applyPalette } = gifenc;

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const entry = join(root, "dist/src/index.js");
const outPath = join(root, "docs", "features.gif");

const APPLE_EMOJI_PATH = "/System/Library/Fonts/Apple Color Emoji.ttc";
const EMOJI_FAMILY = "AppleEmoji";
if (existsSync(APPLE_EMOJI_PATH)) {
  GlobalFonts.registerFromPath(APPLE_EMOJI_PATH, EMOJI_FAMILY);
}

if (!existsSync(entry)) {
  console.error("pino-blanc: yarn build first, then yarn demo:gif");
  process.exit(1);
}

const {
  buildBoxSpans,
  createLogger,
  displayWidth,
  renderBannerLine,
  renderBoxBlock,
  resolveTheme,
  themeSurfaceHex,
  writeBoxToConsole,
} = await import(entry);

const COLS = 74;
const ROWS = 20;
const CELL_W = 9;
const CELL_H = 18;
const FONT = '14px "Menlo", "SF Mono", "Consolas", monospace';
const EMOJI_FONT = `16px "${EMOJI_FAMILY}"`;
const PAD = 16;
const graphemeSegmenter = new Intl.Segmenter("en", { granularity: "grapheme" });

function isEmojiGrapheme(ch) {
  if (!ch || ch === " ") {
    return false;
  }
  for (const unit of ch) {
    const cp = unit.codePointAt(0) ?? 0;
    if (
      (cp >= 0x1f300 && cp <= 0x1faff) ||
      (cp >= 0x1f1e6 && cp <= 0x1f1ff) ||
      (cp >= 0x2600 && cp <= 0x27bf) ||
      (cp >= 0x2300 && cp <= 0x23ff) ||
      cp === 0xfe0f
    ) {
      return true;
    }
  }
  return false;
}

/** Read one grapheme cluster starting at `index` (keeps emoji / ZWJ intact). */
function readGrapheme(text, index) {
  for (const { segment } of graphemeSegmenter.segment(text.slice(index))) {
    return segment;
  }
  return text[index] ?? "";
}

/** Banner rows appear quickly before log lines. */
const DELAY_BANNER_MS = 70;
/** Randomized delay range for log lines after the banner. */
const DELAY_LINE_MIN_MS = 95;
const DELAY_LINE_MAX_MS = 560;
/**
 * Pause when the last line of a printout lands on screen
 * (so the full frame can be read before the next scene).
 */
const DELAY_LAST_LINE_MS = 4000;
/** Full-block scenes (boxes) — appear at once, then hold. */
const DELAY_INSTANT_MS = 4000;
/** Live rewrite tick cadence (progress / JSON) — long enough to read. */
const DELAY_LIVE_TICK_MS = 650;
/** Extra beat on the last live tick before the commit line. */
const DELAY_LIVE_HOLD_MS = 1100;
/** Brief beat between themes. */
const DELAY_THEME_GAP_MS = 300;

function randomLineDelayMs() {
  const span = DELAY_LINE_MAX_MS - DELAY_LINE_MIN_MS;
  return DELAY_LINE_MIN_MS + Math.floor(Math.random() * (span + 1));
}

/**
 * Showcase scenes — max variety in a short loop:
 * levels → live progress → live JSON → events → identity → boxes.
 */
const SHOWCASE = [
  {
    themeId: "dracula",
    kind: "levels",
    subtitle: "shop floor",
    level: "info",
    reveal: "line",
    capture: "levels",
  },
  {
    themeId: "solarized-dark",
    kind: "progress",
    subtitle: "progress",
    level: "info",
    reveal: "live",
    capture: "progress",
  },
  {
    themeId: "catppuccin-mocha",
    kind: "live",
    subtitle: "live json",
    level: "info",
    reveal: "live",
    capture: "liveJson",
  },
  {
    themeId: "nord",
    kind: "events",
    subtitle: "events",
    level: "info",
    reveal: "line",
    capture: "events",
  },
  {
    themeId: "gruvbox-dark",
    kind: "visit",
    subtitle: "checkout",
    level: "verbose",
    reveal: "line",
    capture: "identity",
  },
  {
    themeId: "solarized-light",
    kind: "box",
    subtitle: "receipt",
    level: "info",
    reveal: "instant",
    capture: "boxes",
  },
];

/** Stable tint seeds so chips keep distinct hues across frames. */
const TINT = {
  shop: "wine-shop:maison-du-vin",
  guest: "wine-guest:ada-lopez",
  bottlePinot: "wine-bottle:pinot-noir-2019",
  bottleRioja: "wine-bottle:rioja-crianza-2018",
  clerk: "wine-clerk:sam",
};

/** Kind → leading glyph for identity chips. */
const SYMBOL_MAP = {
  shop: "/",
  guest: "@",
  bottle: "·",
  clerk: "%",
};

const loggerOptions = {
  syncPretty: true,
  level: "trace",
  forceColor: true,
  ansiMode: "truecolor",
  consoleLeadingNewline: false,
};

function capture(fn) {
  let buf = "";
  const orig = process.stdout.write.bind(process.stdout);
  process.stdout.write = (chunk) => {
    buf += typeof chunk === "string" ? chunk : Buffer.from(chunk).toString("utf8");
    return true;
  };
  try {
    fn();
  } finally {
    process.stdout.write = orig;
  }
  return buf;
}

/** Capture each stdout write (needed for `_liveReplace` CSI ticks). */
function captureChunks(fn) {
  /** @type {string[]} */
  const chunks = [];
  const orig = process.stdout.write.bind(process.stdout);
  process.stdout.write = (chunk) => {
    chunks.push(
      typeof chunk === "string" ? chunk : Buffer.from(chunk).toString("utf8"),
    );
    return true;
  };
  try {
    fn();
  } finally {
    process.stdout.write = orig;
  }
  return chunks;
}

function progressBar(pct, width = 12) {
  const clamped = Math.max(0, Math.min(100, pct));
  const filled = Math.round((clamped / 100) * width);
  return `${"█".repeat(filled)}${"░".repeat(width - filled)}`;
}

function stripTrailingEmpty(lines) {
  const out = [...lines];
  while (out.length && out[out.length - 1] === "") {
    out.pop();
  }
  return out;
}

function themeInk(theme) {
  return theme.roles?.message ?? (theme.background === "light" ? "#073642" : "#839496");
}

/** Minimal truecolor SGR terminal for pino-blanc output. */
function createScreen(surfaceHex, inkHex) {
  const cells = Array.from({ length: ROWS }, () =>
    Array.from({ length: COLS }, () => ({
      ch: " ",
      fg: inkHex,
      bg: surfaceHex,
      bold: false,
    })),
  );
  let row = 0;
  let col = 0;
  let fg = inkHex;
  let bg = surfaceHex;
  let bold = false;

  function rgb(r, g, b) {
    return `#${[r, g, b].map((n) => n.toString(16).padStart(2, "0")).join("")}`;
  }

  function applySgr(params) {
    if (params.length === 0 || (params.length === 1 && params[0] === 0)) {
      fg = inkHex;
      bg = surfaceHex;
      bold = false;
      return;
    }
    let i = 0;
    while (i < params.length) {
      const p = params[i] ?? 0;
      if (p === 0) {
        fg = inkHex;
        bg = surfaceHex;
        bold = false;
        i += 1;
      } else if (p === 1) {
        bold = true;
        i += 1;
      } else if (p === 22) {
        bold = false;
        i += 1;
      } else if (p === 39) {
        fg = inkHex;
        i += 1;
      } else if (p === 49) {
        bg = surfaceHex;
        i += 1;
      } else if (p === 38 && params[i + 1] === 2) {
        fg = rgb(params[i + 2] ?? 0, params[i + 3] ?? 0, params[i + 4] ?? 0);
        i += 5;
      } else if (p === 48 && params[i + 1] === 2) {
        bg = rgb(params[i + 2] ?? 0, params[i + 3] ?? 0, params[i + 4] ?? 0);
        i += 5;
      } else if (p === 38 && params[i + 1] === 5) {
        i += 3;
      } else if (p === 48 && params[i + 1] === 5) {
        i += 3;
      } else {
        i += 1;
      }
    }
  }

  function put(ch) {
    if (row >= ROWS || col >= COLS) {
      return;
    }
    const width = Math.max(1, displayWidth(ch));
    cells[row][col] = { ch, fg, bg, bold, emoji: isEmojiGrapheme(ch) };
    // Wide emoji occupy two terminal columns; mark the trailing cell empty.
    for (let k = 1; k < width && col + k < COLS; k += 1) {
      cells[row][col + k] = {
        ch: "",
        fg,
        bg,
        bold: false,
        emoji: false,
      };
    }
    col += width;
  }

  function write(text) {
    let i = 0;
    while (i < text.length) {
      if (text[i] === "\n") {
        row += 1;
        col = 0;
        if (row >= ROWS) {
          cells.shift();
          cells.push(
            Array.from({ length: COLS }, () => ({
              ch: " ",
              fg: inkHex,
              bg: surfaceHex,
              bold: false,
              emoji: false,
            })),
          );
          row = ROWS - 1;
        }
        i += 1;
        continue;
      }
      if (text[i] === "\r") {
        col = 0;
        i += 1;
        continue;
      }
      if (text[i] === "\u001B" && text[i + 1] === "[") {
        let end = i + 2;
        while (end < text.length && !/[A-Za-z]/.test(text[end])) {
          end += 1;
        }
        if (end >= text.length) {
          i += 1;
          continue;
        }
        const letter = text[end];
        const body = text.slice(i + 2, end);
        const params = body
          .split(";")
          .filter((s) => s.length)
          .map((s) => Number.parseInt(s, 10))
          .map((n) => (Number.isFinite(n) ? n : 0));
        if (letter === "m") {
          applySgr(params);
        } else if (letter === "A") {
          const n = params[0] || 1;
          row = Math.max(0, row - n);
        } else if (letter === "J") {
          const mode = params[0] ?? 0;
          if (mode === 0) {
            eraseFromCursor();
          } else if (mode === 2) {
            clear();
          }
        }
        i = end + 1;
        continue;
      }
      const grapheme = readGrapheme(text, i);
      if (!grapheme) {
        i += 1;
        continue;
      }
      put(grapheme);
      i += grapheme.length;
    }
  }

  function blankCell() {
    return {
      ch: " ",
      fg: inkHex,
      bg: surfaceHex,
      bold: false,
      emoji: false,
    };
  }

  function eraseFromCursor() {
    if (row >= ROWS) {
      return;
    }
    for (let c = col; c < COLS; c += 1) {
      cells[row][c] = blankCell();
    }
    for (let r = row + 1; r < ROWS; r += 1) {
      for (let c = 0; c < COLS; c += 1) {
        cells[r][c] = blankCell();
      }
    }
  }

  function clear() {
    for (let r = 0; r < ROWS; r += 1) {
      for (let c = 0; c < COLS; c += 1) {
        cells[r][c] = blankCell();
      }
    }
    row = 0;
    col = 0;
    fg = inkHex;
    bg = surfaceHex;
    bold = false;
  }

  return { cells, write, clear, surfaceHex, inkHex };
}

function renderFrame(screen) {
  const width = PAD * 2 + COLS * CELL_W;
  const height = PAD * 2 + ROWS * CELL_H;
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = screen.surfaceHex;
  ctx.fillRect(0, 0, width, height);
  ctx.font = FONT;
  ctx.textBaseline = "top";

  for (let r = 0; r < ROWS; r += 1) {
    for (let c = 0; c < COLS; c += 1) {
      const cell = screen.cells[r][c];
      const x = PAD + c * CELL_W;
      const y = PAD + r * CELL_H;
      const span = Math.max(1, cell.ch ? displayWidth(cell.ch) : 1);
      if (cell.bg !== screen.surfaceHex) {
        ctx.fillStyle = cell.bg;
        ctx.fillRect(x, y, CELL_W * span, CELL_H);
      }
      if (cell.ch && cell.ch !== " ") {
        if (cell.emoji) {
          ctx.font = EMOJI_FONT;
          ctx.fillText(cell.ch, x, y);
        } else {
          ctx.font = cell.bold ? `bold ${FONT}` : FONT;
          ctx.fillStyle = cell.fg;
          ctx.fillText(cell.ch, x, y + 1);
        }
      }
    }
  }

  const img = ctx.getImageData(0, 0, width, height);
  return { width, height, data: img.data };
}

function sceneLines(themeId, subtitle, bodyAnsi, level = "info") {
  const banner = renderBannerLine(
    {
      title: "pino-blanc",
      subtitle,
      level,
    },
    themeId,
  );
  const bannerLines = stripTrailingEmpty(banner.replace(/\r/g, "").split("\n"));
  // Drop leading blank lines from captured body so we control the gap.
  const bodyLines = stripTrailingEmpty(
    bodyAnsi.replace(/\r/g, "").split("\n"),
  ).filter((line, index, arr) => {
    if (line !== "") {
      return true;
    }
    // keep blank lines that sit between body rows, not before the first
    return arr.slice(0, index).some((l) => l !== "");
  });
  // Always one clear line between banner and first log row.
  const withGap = [...bannerLines, "", ...bodyLines];
  return {
    bannerCount: bannerLines.length + 1,
    lines: withGap,
  };
}

function captureLevels(themeId) {
  return capture(() => {
    const shop = createLogger("shop", { ...loggerOptions, theme: themeId });
    const cart = createLogger("cart", { ...loggerOptions, theme: themeId });
    const till = createLogger("till", { ...loggerOptions, theme: themeId });
    shop.trace("doors.open", { hour: 10 });
    shop.debug("shelf.scan", { aisle: "Burgundy" });
    shop.info("guest.welcome", { name: "Ada" });
    cart.info("item.added", { wine: "Pinot Noir", year: 2019 });
    cart.debug("stock.low", { sku: "PN-19", left: 2 });
    till.error("card.declined", { last4: "4242", attempt: 1 });
    till.info("card.approved", { total: 48.5, currency: "USD" });
  });
}

/** Default event layout: emoji + event name + meta (no identity chips). */
function captureEvents(themeId) {
  return capture(() => {
    const log = createLogger("visit", {
      ...loggerOptions,
      theme: themeId,
      eventLayout: "default",
    });
    const events = [
      ["shop.open", { _emoji: "🏪", city: "Portland" }],
      ["guest.arrived", { _emoji: "👋", name: "Ada", party: 2 }],
      ["bottle.picked", { _emoji: "🍷", wine: "Pinot Noir", year: 2019 }],
      ["clerk.recommend", { _emoji: "💬", pair: "roast chicken" }],
      ["checkout.paid", { _emoji: "✅", total: 56, tip: 8 }],
    ];
    for (const [name, fields] of events) {
      log.event(name, fields);
      process.stdout.write("\n");
    }
  });
}

function captureIdentity(themeId) {
  return capture(() => {
    const log = createLogger("visit", {
      ...loggerOptions,
      theme: themeId,
      eventLayout: "complex",
      symbolMap: SYMBOL_MAP,
    });
    const samples = [
      {
        event: "shop.open",
        kind: "shop",
        body: "maison-du-vin",
        tint: TINT.shop,
        meta: { city: "Portland", open: true },
      },
      {
        event: "guest.arrived",
        kind: "guest",
        body: "ada-lopez",
        tint: TINT.guest,
        meta: { party: 2, occasion: "dinner" },
      },
      {
        event: "bottle.picked",
        kind: "bottle",
        body: "pinot-noir-2019",
        tint: TINT.bottlePinot,
        meta: { region: "Willamette", price: 32 },
      },
      {
        event: "bottle.picked",
        kind: "bottle",
        body: "rioja-crianza",
        tint: TINT.bottleRioja,
        meta: { region: "Rioja", price: 24 },
      },
      {
        event: "clerk.recommend",
        kind: "clerk",
        body: "sam",
        tint: TINT.clerk,
        meta: { pair: "roast chicken" },
      },
      {
        event: "checkout.paid",
        kind: "guest",
        body: "ada-lopez",
        tint: TINT.guest,
        meta: { total: 56, tip: 8 },
      },
    ];
    for (const s of samples) {
      log.event(s.event, {
        _identityKind: s.kind,
        _identityBody: s.body,
        _identityTintKey: s.tint,
        _identityChrome: "fill",
        ...s.meta,
      });
      // Blank line under each two-row identity event block.
      process.stdout.write("\n");
    }
  });
}

function captureBoxes(themeId) {
  return capture(() => {
    const opts = { theme: themeId, consoleColorReset: "triple" };
    for (const { subtitle, tint, chrome, level } of [
      {
        subtitle: "/maison-du-vin",
        tint: TINT.shop,
        chrome: "inverted",
        level: "debug",
      },
      {
        subtitle: "@ada-lopez",
        tint: TINT.guest,
        chrome: "faint",
        level: "info",
      },
      {
        subtitle: "·pinot-noir-2019",
        tint: TINT.bottlePinot,
        chrome: "fill",
        level: "verbose",
      },
    ]) {
      const spans = buildBoxSpans({
        boxLayout: "complex",
        title: "wine night",
        version: "0.1.0",
        level, // → e.g. "warning level" in the title band
        subtitle,
        identityTintKey: tint,
        identityChrome: chrome,
      });
      writeBoxToConsole(renderBoxBlock(spans, opts));
      // Blank line under each receipt box.
      process.stdout.write("\n");
    }
  });
}

/**
 * Capture one pretty write at a time (no CSI). GIF live scenes rebuild
 * banner + current tick each frame so rewrites are obvious in the loop.
 */
function captureOne(fn) {
  const chunks = captureChunks(fn);
  return chunks.join("");
}

/** Live progress bar ticks — bar in the message row. */
function captureProgressLive(themeId) {
  const total = 8;
  const steps = [0, 25, 50, 75, 100];
  const ticks = steps.map((pct) => {
    const packed = Math.round((pct / 100) * total);
    return captureOne(() => {
      const log = createLogger("cellar", {
        ...loggerOptions,
        theme: themeId,
        layout: "complex",
      });
      log.info(`${progressBar(pct, 16)} ${String(pct).padStart(3, " ")}%`, {
        _emoji: "📦",
        n: packed,
        of: total,
      });
    });
  });
  const done = captureOne(() => {
    const log = createLogger("cellar", {
      ...loggerOptions,
      theme: themeId,
      layout: "complex",
    });
    log.info("packed", {
      _emoji: "✅",
      bottles: total,
      durationMs: DELAY_LIVE_TICK_MS * (steps.length - 1),
    });
  });
  return { ticks, done };
}

/** Live JSON field rewrites — changing seq/bytes (no progress bar). */
function captureLiveJsonLive(themeId) {
  const steps = [0, 1, 2, 3, 4, 5, 6, 7];
  const ticks = steps.map((i) =>
    captureOne(() => {
      const log = createLogger("peer", {
        ...loggerOptions,
        theme: themeId,
        eventLayout: "default",
      });
      log.event("ws.frame", {
        _emoji: "📨",
        seq: i + 1,
        bytes: 64 + i * 24,
        path: "/ws/",
      });
    }),
  );
  const done = captureOne(() => {
    const log = createLogger("peer", {
      ...loggerOptions,
      theme: themeId,
      eventLayout: "default",
    });
    log.event("ws.batch_done", {
      _emoji: "✅",
      frames: steps.length,
      bytes: 64 + (steps.length - 1) * 24,
    });
  });
  return { ticks, done };
}

function captureFor(kind, themeId) {
  switch (kind) {
    case "levels":
      return captureLevels(themeId);
    case "events":
      return captureEvents(themeId);
    case "identity":
      return captureIdentity(themeId);
    case "boxes":
      return captureBoxes(themeId);
    default: {
      const _exhaustive = kind;
      throw new Error(`Unknown capture kind: ${_exhaustive}`);
    }
  }
}

function captureLiveFor(kind, themeId) {
  switch (kind) {
    case "progress":
      return captureProgressLive(themeId);
    case "liveJson":
      return captureLiveJsonLive(themeId);
    default: {
      const _exhaustive = kind;
      throw new Error(`Unknown live capture kind: ${_exhaustive}`);
    }
  }
}

function buildScenes() {
  /** @type {{ themeId: string, label: string, reveal: "line" | "instant" | "live", lines?: string[], bannerCount?: number, bannerLines?: string[], ticks?: string[], done?: string }[]} */
  return SHOWCASE.map((item) => {
    if (item.reveal === "live") {
      const banner = renderBannerLine(
        {
          title: "pino-blanc",
          subtitle: item.subtitle,
          level: item.level,
        },
        item.themeId,
      );
      const bannerLines = stripTrailingEmpty(
        banner.replace(/\r/g, "").split("\n"),
      );
      const live = captureLiveFor(item.capture, item.themeId);
      return {
        themeId: item.themeId,
        label: `${item.themeId} · ${item.kind}`,
        reveal: "live",
        bannerLines,
        bannerCount: bannerLines.length + 1,
        ticks: live.ticks,
        done: live.done,
      };
    }
    const built = sceneLines(
      item.themeId,
      item.subtitle,
      captureFor(item.capture, item.themeId),
      item.level,
    );
    return {
      themeId: item.themeId,
      label: `${item.themeId} · ${item.kind}`,
      reveal: item.reveal,
      ...built,
    };
  });
}

function cloneScreen(screen) {
  return {
    cells: screen.cells.map((row) => row.map((c) => ({ ...c }))),
    surfaceHex: screen.surfaceHex,
    inkHex: screen.inkHex,
  };
}

function framesFromScenes(scenes) {
  const frames = [];

  for (const scene of scenes) {
    const theme = resolveTheme(scene.themeId);
    const surfaceHex = themeSurfaceHex(theme);
    const inkHex = themeInk(theme);
    const screen = createScreen(surfaceHex, inkHex);

    if (scene.reveal === "instant") {
      // Banner + body (receipt boxes, etc.) in a single frame.
      screen.write(`${scene.lines.join("\n")}\n`);
      frames.push({ screen: cloneScreen(screen), delay: DELAY_INSTANT_MS });
    } else if (scene.reveal === "live") {
      // Rebuild banner + tick each frame so JSON/progress rewrites read clearly.
      const head = `${scene.bannerLines.join("\n")}\n\n`;
      screen.write(head);
      frames.push({ screen: cloneScreen(screen), delay: DELAY_BANNER_MS });

      for (let i = 0; i < scene.ticks.length; i += 1) {
        screen.clear();
        screen.write(`${head}${scene.ticks[i]}`);
        const isLastTick = i === scene.ticks.length - 1;
        frames.push({
          screen: cloneScreen(screen),
          delay: isLastTick ? DELAY_LIVE_HOLD_MS : DELAY_LIVE_TICK_MS,
        });
      }

      // Commit line under the final live tick (non-replace).
      const lastTick = scene.ticks[scene.ticks.length - 1] ?? "";
      screen.clear();
      screen.write(`${head}${lastTick}${scene.done}`);
      frames.push({ screen: cloneScreen(screen), delay: DELAY_LAST_LINE_MS });
    } else {
      // Banner/box header appears all at once, then log lines type out.
      const bannerLines = scene.lines.slice(0, scene.bannerCount);
      const bodyLines = scene.lines.slice(scene.bannerCount);
      let acc = `${bannerLines.join("\n")}\n`;
      screen.write(acc);
      frames.push({ screen: cloneScreen(screen), delay: DELAY_BANNER_MS });

      for (let i = 0; i < bodyLines.length; i += 1) {
        acc += `${bodyLines[i]}\n`;
        screen.clear();
        screen.write(acc);
        const delay =
          i === bodyLines.length - 1 ? DELAY_LAST_LINE_MS : randomLineDelayMs();
        frames.push({ screen: cloneScreen(screen), delay });
      }
    }

    // Brief solid beat only when leaving a theme (after its box scene).
    if (scene.reveal === "instant") {
      const gap = createScreen(surfaceHex, inkHex);
      frames.push({ screen: cloneScreen(gap), delay: DELAY_THEME_GAP_MS });
    }
  }

  return frames;
}

function encodeGif(frames) {
  const first = renderFrame(frames[0].screen);
  const { width, height } = first;
  const gif = GIFEncoder();

  for (let i = 0; i < frames.length; i += 1) {
    const frame = frames[i];
    const { data } = renderFrame(frame.screen);
    const palette = quantize(data, 256);
    const index = applyPalette(data, palette);
    // gifenc expects delay in milliseconds (it divides by 10 for GIF centiseconds).
    gif.writeFrame(index, width, height, {
      palette,
      delay: Math.max(20, frame.delay),
      ...(i === 0 ? { repeat: 0 } : {}),
    });
  }
  gif.finish();
  return Buffer.from(gif.bytes());
}

mkdirSync(dirname(outPath), { recursive: true });
const scenes = buildScenes();
const frames = framesFromScenes(scenes);
const buf = encodeGif(frames);
const stream = createWriteStream(outPath);
stream.write(buf);
stream.end();
await new Promise((resolve, reject) => {
  stream.on("finish", resolve);
  stream.on("error", reject);
});

const totalMs = frames.reduce((sum, f) => sum + f.delay, 0);
console.log(
  `wrote ${outPath} (${buf.length} bytes, ${frames.length} frames, ${scenes.length} scenes, ~${(totalMs / 1000).toFixed(1)}s)`,
);
