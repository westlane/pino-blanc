import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { load as loadYaml } from "js-yaml";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const ymlPath = path.join(root, "config", "layout.yml");
const tsPath = path.join(root, "src", "layout", "layout.data.ts");

function edgePad(inner) {
  const lead = inner.match(/^[-\s]*/)?.[0]?.length ?? 0;
  const trail = inner.match(/[-\s]*$/)?.[0]?.length ?? 0;
  if (lead + trail >= inner.length) {
    return { lead: inner.length, trail: 0 };
  }
  return { lead, trail };
}

function parseBoxFrame(source) {
  const lines = source
    .split("\n")
    .map((l) => l.trimEnd())
    .filter((l) => l.trim().length > 0);
  if (lines.length < 1) {
    throw new Error("box frame must have at least one […] line");
  }
  const parseFrameLine = (line) => {
    const trimmed = line.trim();
    const slots = [...trimmed.matchAll(/\[([^\]]*)\]/g)].map((m) => m[1] ?? "");
    if (slots.length === 1) {
      const inner = slots[0] ?? "";
      const { lead, trail } = edgePad(inner);
      return {
        width: inner.length,
        pad: lead + trail,
        content: Math.max(1, inner.length - lead - trail),
        band: inner,
      };
    }
    if (slots.length === 3) {
      const left = slots[0] ?? "";
      const mid = slots[1] ?? "";
      const right = slots[2] ?? "";
      const pad = left.length + right.length;
      return { width: pad + mid.length, pad, content: mid.length, band: mid };
    }
    throw new Error(
      `box frame line needs one [band] or three [pad][content][pad] brackets, got ${slots.length}: ${line}`,
    );
  };
  const parsed = lines.map(parseFrameLine);
  const width = Math.max(...parsed.map((p) => p.width));
  const minInner = Math.min(...parsed.map((p) => p.width));
  return {
    width,
    minInner: Math.max(1, minInner),
    pad: Math.max(0, parsed[0]?.pad ?? 0),
    bands: parsed.map((p) => p.band),
  };
}

function requireDefaultPreset(section, map) {
  if (!map || typeof map !== "object") {
    throw new Error(`layout.yml: \`${section}\` presets are required`);
  }
  if (typeof map.default !== "string") {
    throw new Error(
      `layout.yml: ${section}.default is required (the fallback preset)`,
    );
  }
}

const raw = fs.readFileSync(ymlPath, "utf8");
const doc = loadYaml(raw);

requireDefaultPreset("text", doc.text);
requireDefaultPreset("event", doc.event);
requireDefaultPreset("box", doc.box);

if (!doc.tint?.multiplier) {
  throw new Error("layout.yml: `tint.multiplier` is required");
}

// Drop legacy top-level default pointers if present in older files.
delete doc.default;
delete doc.boxDefault;

for (const section of ["text", "event"]) {
  for (const [id, template] of Object.entries(doc[section])) {
    if (typeof template !== "string" || !template.includes("%")) {
      throw new Error(`layout.yml: ${section}.${id} must be a template string`);
    }
    doc[section][id] = template.trimEnd();
  }
}

if (typeof doc.box === "string") {
  doc.box = { default: parseBoxFrame(doc.box) };
} else {
  const compiled = {};
  for (const [id, frame] of Object.entries(doc.box)) {
    if (typeof frame !== "string") {
      throw new Error(`layout.yml: box.${id} must be a visual […] frame string`);
    }
    compiled[id] = parseBoxFrame(frame);
    if (!compiled[id].bands.length) {
      throw new Error(`layout.yml: box.${id} must have at least one band`);
    }
  }
  doc.box = compiled;
}

const body = `// Generated from config/layout.yml — do not edit.
import type { LayoutData } from "../types/layout.js";

export const layoutData: LayoutData = ${JSON.stringify(doc, null, 2)};

/** Active box preset (\`box.default\`) — metrics for formatBoxLine. */
export const box = layoutData.box.default;
export const tint = layoutData.tint;
`;

fs.writeFileSync(tsPath, body, "utf8");
console.log(`Wrote ${path.relative(root, tsPath)}`);
