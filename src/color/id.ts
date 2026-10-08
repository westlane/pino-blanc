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
  return ramp[idx] ?? ramp[0];
}
