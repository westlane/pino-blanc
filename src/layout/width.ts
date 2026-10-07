const ANSI_RE = /\u001B\[[0-9;]*m/g;

export function stripAnsi(text: string): string {
  return text.replace(ANSI_RE, "");
}

/**
 * Terminal display width (strip ANSI; wide / supplemental emoji count as 2 columns).
 */
export function displayWidth(text: string): number {
  const stripped = stripAnsi(text);
  let w = 0;
  let i = 0;
  while (i < stripped.length) {
    const cp = stripped.codePointAt(i) ?? stripped.charCodeAt(i);
    if (cp === 0xfe0f || cp === 0xfe0e || cp === 0x200d) {
      i += 1;
      continue;
    }
    const isWide =
      (cp >= 0x1f300 && cp <= 0x1f9ff) ||
      (cp >= 0x1fa70 && cp <= 0x1faff) ||
      (cp >= 0x1f1e6 && cp <= 0x1f1ff) ||
      cp > 0xffff;
    w += isWide ? 2 : 1;
    i += cp > 0xffff ? 2 : 1;
  }
  return w;
}

export function truncateEnd(text: string, max: number): string {
  const plain = stripAnsi(text);
  if (plain.length <= max) {
    return text;
  }
  if (max <= 3) {
    return plain.slice(0, max);
  }
  return plain.slice(0, max - 3) + "...";
}
