const ANSI_RE = /\u001B\[[0-9;]*m/g;

export function stripAnsi(text: string): string {
  return text.replace(ANSI_RE, "");
}

export function displayWidth(text: string): number {
  return stripAnsi(text).length;
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
