export function hexToCssBg(hex: string): string {
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
  return `background: rgb(${r}, ${g}, ${b})`;
}

export function hexToCssChrome(background: string, foreground: string, bold = false): string {
  const weight = bold ? "font-weight: 700;" : "";
  const bg = hexToCssBg(background);
  const fg = hexToCssFg(foreground);
  return `${bg}; ${fg}; ${weight}`;
}

export function hexToCssFg(hex: string): string {
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
  return `color: rgb(${r}, ${g}, ${b})`;
}
