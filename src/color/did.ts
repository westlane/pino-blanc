import type { Colorize } from "../types.js";

/**
 * Deterministic mid-range hex from a string seed (identity palette).
 * Same algorithm as `common DID color hashing` `generateColorFromString`.
 */
export function generateColorFromString(str: string): string {
  const normalized = str.toLowerCase();
  let hash = 1256;
  for (let i = 0; i < normalized.length; i++) {
    hash = (hash << 5) + hash + normalized.charCodeAt(i);
  }

  const components: string[] = [];
  for (let i = 0; i < 3; i++) {
    const value = 0x60 + ((hash >> (i * 10)) & 0x7f);
    components.push(value.toString(16).padStart(2, "0"));
  }

  return `#${components[1]}${components[2]}${components[0]}`;
}

/** Multibase key body without leading `z`/`Z` (signing DID identifier). */
export function didColorSeed(did: string): string {
  const trimmed = did.trim();
  if (!trimmed.startsWith("did:")) {
    return trimmed;
  }
  const match = trimmed.match(/^did:[^:]+:(.*)$/s);
  const key = match?.[1] ?? trimmed;
  const base58 = key.replace(/^[zZ]/, "");
  return base58.length >= 6 ? base58 : trimmed;
}

/** Hex for a `did:…` tint key, or `null` when the id is not a DID. */
export function colorFromDid(id: string): string | null {
  const trimmed = id.trim();
  if (!trimmed.startsWith("did:")) {
    return null;
  }
  return generateColorFromString(didColorSeed(trimmed));
}

/**
 * Default {@link Colorize}: DID tint keys use the identity palette;
 * everything else keeps the theme ramp hex.
 */
export const didColorize: Colorize = (id, defaultHex) => {
  return colorFromDid(id) ?? defaultHex;
};
