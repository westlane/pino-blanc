export type SymbolMap = Record<string, string>;

export function glyphSet(map: SymbolMap | undefined): Set<string> {
  if (!map) {
    return new Set();
  }
  return new Set(Object.values(map));
}

export function applySymbol(
  kind: string,
  body: string,
  map: SymbolMap | undefined,
): string {
  const trimmed = body.trim();
  if (!trimmed || !map) {
    return trimmed;
  }
  const glyph = map[kind];
  if (!glyph) {
    return trimmed;
  }
  if (trimmed.startsWith(glyph)) {
    return trimmed;
  }
  return `${glyph}${trimmed}`;
}

export type SplitPrefix = {
  glyph: string;
  body: string;
};

export function splitPrefix(
  tag: string,
  map: SymbolMap | undefined,
): SplitPrefix | null {
  const trimmed = tag.trim();
  if (!trimmed || !map) {
    return null;
  }
  const glyphs = glyphSet(map);
  const first = trimmed.charAt(0);
  if (!glyphs.has(first)) {
    return null;
  }
  const body = trimmed.slice(1);
  if (!body) {
    return null;
  }
  return { glyph: first, body };
}
