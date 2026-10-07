/**
 * Quick check that pretty output contains ANSI escapes (run after `yarn build`).
 *   yarn verify:ansi
 * Exits 1 if no escapes — usually means stale dist or PINO_BLANC_PLAIN=1.
 */
import { existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const entry = join(root, "dist/src/node/format-record.js");

if (!existsSync(entry)) {
  console.error("Run: yarn build");
  process.exit(1);
}

const prevNo = process.env.NO_COLOR;
const prevForce = process.env.FORCE_COLOR;
process.env.NO_COLOR = "1";
delete process.env.FORCE_COLOR;

const { formatPinoLogLine } = await import(entry);
const line = formatPinoLogLine(
  { level: 30, msg: "ansi-check", module: "verify", blancEvent: true },
  { options: { theme: "solarized-dark" } },
  false,
);

if (prevNo === undefined) delete process.env.NO_COLOR;
else process.env.NO_COLOR = prevNo;
if (prevForce === undefined) delete process.env.FORCE_COLOR;
else process.env.FORCE_COLOR = prevForce;

const escapes = (line.match(/\u001B/g) ?? []).length;
if (escapes < 4) {
  console.error("FAIL: expected ANSI escapes in pretty line, got:", JSON.stringify(line));
  process.exit(1);
}
const { resolveAnsiMode } = await import(join(root, "dist/src/color/gate.js"));
const palette = resolveAnsiMode({ ansiMode: "auto" });
console.log("OK: ANSI escapes in pretty output:", escapes);
console.log(
  `palette=${palette} COLORTERM=${process.env.COLORTERM ?? "(unset)"} — sample strips ANSI below`,
);
console.log("Sample (visible):", line.replace(/\u001B\[[0-9;]*m/g, ""));
if (!line.includes("38;5;") && !line.includes("38;2;")) {
  console.warn("WARN: expected 38;5 (256) or 38;2 (truecolor) sequences");
}
