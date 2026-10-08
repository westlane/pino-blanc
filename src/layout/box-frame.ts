/**
 * Parse a visual `box` frame from layout.yml:
 *
 * ```
 * [------------------------------------------------]
 * [-------- %title% %version% - %lv% level --------]
 * [------------------------------------------------]
 * [------------------ %subtitle% ------------------]
 * [------------------------------------------------]
 * ```
 *
 * - One `[…]` per band
 * - Hyphen-only bands are padding rows (empty bars above/below content)
 * - Width = longest inner; minInner = shortest; pad = edge dashes/spaces on row 1
 * - Legacy `[pad][content][pad]` three-slot rows still accepted
 */

export type BoxMetrics = {
  width: number;
  minInner: number;
  pad: number;
  /** Inner text of each `[…]` band (title, subtitle, …). */
  bands: string[];
};

const BRACKET_RE = /\[([^\]]*)\]/g;

function edgePad(inner: string): { lead: number; trail: number } {
  const lead = inner.match(/^[-\s]*/)?.[0]?.length ?? 0;
  const trail = inner.match(/[-\s]*$/)?.[0]?.length ?? 0;
  if (lead + trail >= inner.length) {
    return { lead: inner.length, trail: 0 };
  }
  return { lead, trail };
}

function parseFrameLine(line: string): {
  width: number;
  pad: number;
  content: number;
  band: string;
} {
  const trimmed = line.trim();
  const slots = [...trimmed.matchAll(BRACKET_RE)].map((m) => m[1] ?? "");
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
    const content = mid.length;
    return { width: pad + content, pad, content, band: mid };
  }
  throw new Error(
    `box frame line needs one [band] or three [pad][content][pad] brackets, got ${slots.length}: ${line}`,
  );
}

export function parseBoxFrame(source: string): BoxMetrics {
  const lines = source
    .split("\n")
    .map((l) => l.trimEnd())
    .filter((l) => l.trim().length > 0);
  if (lines.length < 1) {
    throw new Error("box frame must have at least one […] line");
  }
  const parsed = lines.map((l) => parseFrameLine(l));
  const width = Math.max(...parsed.map((p) => p.width));
  const minInner = Math.min(...parsed.map((p) => p.width));
  const pad = parsed[0]?.pad ?? 0;
  return {
    width,
    minInner: Math.max(1, minInner),
    pad: Math.max(0, pad),
    bands: parsed.map((p) => p.band),
  };
}
