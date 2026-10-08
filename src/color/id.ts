import { getTintMultiplier } from "../layout/layout-store.js";

export function hashString(input: string): number {
  let hash = 0;
  const mult = getTintMultiplier();
  for (let i = 0; i < input.length; i++) {
    hash = hash * mult + input.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

export function colorFromId(id: string, ramp: string[]): string {
  if (ramp.length === 0) {
    return "#ffffff";
  }
  const idx = hashString(id.toLowerCase()) % ramp.length;
  return ramp[idx] ?? ramp[0] ?? "#ffffff";
}

/**
 * Like {@link colorFromId}, but walks the ramp to skip reserved swatches
 * (e.g. error/warn reds so module `[tags]` never look like level alerts).
 */
export function colorFromIdAvoiding(
  id: string,
  ramp: string[],
  avoid: ReadonlySet<string>,
): string {
  if (ramp.length === 0) {
    return "#ffffff";
  }
  const blocked = new Set([...avoid].map((hex) => hex.toLowerCase()));
  const start = hashString(id.toLowerCase()) % ramp.length;
  for (let i = 0; i < ramp.length; i += 1) {
    const hex = ramp[(start + i) % ramp.length] ?? ramp[0] ?? "#ffffff";
    if (!blocked.has(hex.toLowerCase())) {
      return hex;
    }
  }
  return ramp[start] ?? ramp[0] ?? "#ffffff";
}
