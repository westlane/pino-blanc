import { load as loadYaml } from "js-yaml";
import type { BoxLayoutPreset, LayoutData } from "../types/layout.js";

function edgePad(inner: string): { lead: number; trail: number } {
  const lead = inner.match(/^[-\s]*/)?.[0]?.length ?? 0;
  const trail = inner.match(/[-\s]*$/)?.[0]?.length ?? 0;
  if (lead + trail >= inner.length) {
    return { lead: inner.length, trail: 0 };
  }
  return { lead, trail };
}

function parseBoxFrame(source: string): BoxLayoutPreset {
  const lines = source
    .split("\n")
    .map((l) => l.trimEnd())
    .filter((l) => l.trim().length > 0);
  if (lines.length < 1) {
    throw new Error("box frame must have at least one […] line");
  }
  const parsed = lines.map((line) => {
    const trimmed = line.trim();
    const slots = [...trimmed.matchAll(/\[([^\]]*)\]/g)].map((m) => m[1] ?? "");
    if (slots.length === 1) {
      const inner = slots[0] ?? "";
      const { lead, trail } = edgePad(inner);
      return {
        width: inner.length,
        pad: lead + trail,
        band: inner,
      };
    }
    if (slots.length === 3) {
      const left = slots[0] ?? "";
      const mid = slots[1] ?? "";
      const right = slots[2] ?? "";
      return {
        width: left.length + mid.length + right.length,
        pad: left.length + right.length,
        band: mid,
      };
    }
    throw new Error(
      `box frame line needs one [band] or three [pad][content][pad] brackets, got ${slots.length}: ${line}`,
    );
  });
  const width = Math.max(...parsed.map((p) => p.width));
  const minInner = Math.min(...parsed.map((p) => p.width));
  return {
    width,
    minInner: Math.max(1, minInner),
    pad: Math.max(0, parsed[0]?.pad ?? 0),
    bands: parsed.map((p) => p.band),
  };
}

function requireDefaultPreset(
  section: string,
  map: unknown,
): asserts map is Record<string, unknown> {
  if (!map || typeof map !== "object") {
    throw new Error(`layout.yml: \`${section}\` presets are required`);
  }
  if (typeof (map as { default?: unknown }).default !== "string") {
    throw new Error(
      `layout.yml: ${section}.default is required (the fallback preset)`,
    );
  }
}

/** Parse `config/layout.yml` contents into runtime layout data. */
export function parseLayoutYaml(raw: string): LayoutData {
  const doc = loadYaml(raw) as Record<string, unknown>;
  requireDefaultPreset("text", doc.text);
  requireDefaultPreset("event", doc.event);
  requireDefaultPreset("box", doc.box);

  const tint = doc.tint as { multiplier?: number } | undefined;
  if (!tint?.multiplier) {
    throw new Error("layout.yml: `tint.multiplier` is required");
  }

  const text: Record<string, string> = {};
  for (const [id, template] of Object.entries(doc.text)) {
    if (typeof template !== "string" || !template.includes("%")) {
      throw new Error(`layout.yml: text.${id} must be a template string`);
    }
    text[id] = template.trimEnd();
  }

  const event: Record<string, string> = {};
  for (const [id, template] of Object.entries(doc.event)) {
    if (typeof template !== "string" || !template.includes("%")) {
      throw new Error(`layout.yml: event.${id} must be a template string`);
    }
    event[id] = template.trimEnd();
  }

  const box: Record<string, BoxLayoutPreset> = {};
  if (typeof doc.box === "string") {
    box.default = parseBoxFrame(doc.box);
  } else {
    for (const [id, frame] of Object.entries(doc.box)) {
      if (typeof frame !== "string") {
        throw new Error(`layout.yml: box.${id} must be a visual […] frame string`);
      }
      box[id] = parseBoxFrame(frame);
      if (!box[id].bands.length) {
        throw new Error(`layout.yml: box.${id} must have at least one band`);
      }
    }
  }

  return {
    text,
    event,
    box,
    tint: { multiplier: tint.multiplier },
  };
}
