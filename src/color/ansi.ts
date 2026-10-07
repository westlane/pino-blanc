export const ANSI_RESET = "\u001B[0m";

export function hexToAnsiFg(hex: string, bold = false): string {
  const clean = hex.replace(/^#/, "");
  if (clean.length < 6) {
    return "";
  }
  const r = Number.parseInt(clean.slice(0, 2), 16);
  const g = Number.parseInt(clean.slice(2, 4), 16);
  const b = Number.parseInt(clean.slice(4, 6), 16);
  if (Number.isNaN(r) || Number.isNaN(g) || Number.isNaN(b)) {
    return "";
  }
  const weight = bold ? "1;" : "";
  return `\u001B[${weight}38;2;${r};${g};${b}m`;
}

export function wrapAnsi(text: string, hex: string | undefined): string {
  if (!hex) {
    return text;
  }
  const open = hexToAnsiFg(hex);
  if (!open) {
    return text;
  }
  return `${open}${text}${ANSI_RESET}`;
}
