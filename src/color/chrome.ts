import type { ChipChrome, LogTheme } from "../types.js";

export const SURFACE_WHITE_HEX = "#ffffff";
export const SURFACE_INK_HEX = "#212121";

/** Fraction of identity hue retained on faint chip backgrounds. */
export const FAINT_BG_COLOR_WEIGHT = 0.12;

/** Fraction retained on soft fill chips. */
export const FILL_BG_COLOR_WEIGHT = 0.25;

const DEFAULT_BOX_BG_DARK = "#586e75";
const DEFAULT_BOX_BG_LIGHT = "#93a1a1";

export type ChromeColors = {
  background: string;
  foreground: string;
};

function rgbTripletFromHex(hex: string): { r: number; g: number; b: number } {
  const clean = hex.replace("#", "");
  return {
    r: Number.parseInt(clean.substring(0, 2), 16),
    g: Number.parseInt(clean.substring(2, 4), 16),
    b: Number.parseInt(clean.substring(4, 6), 16),
  };
}

export function normalizeHex(hex: string): string {
  const clean = hex.replace("#", "");
  return `#${clean}`;
}

export function blendHexWithWhite(hex: string, whiteWeight = 0.5): string {
  const clean = hex.replace("#", "");
  const r = Number.parseInt(clean.substring(0, 2), 16);
  const g = Number.parseInt(clean.substring(2, 4), 16);
  const b = Number.parseInt(clean.substring(4, 6), 16);
  const mix = (channel: number) =>
    Math.round(channel * (1 - whiteWeight) + 255 * whiteWeight);
  const toHex = (n: number) => n.toString(16).padStart(2, "0");
  return `#${toHex(mix(r))}${toHex(mix(g))}${toHex(mix(b))}`;
}

export function blendHexWithBlack(hex: string, blackWeight = 0.5): string {
  const clean = hex.replace("#", "");
  const r = Number.parseInt(clean.substring(0, 2), 16);
  const g = Number.parseInt(clean.substring(2, 4), 16);
  const b = Number.parseInt(clean.substring(4, 6), 16);
  const mix = (channel: number) => Math.round(channel * (1 - blackWeight));
  const toHex = (n: number) => n.toString(16).padStart(2, "0");
  return `#${toHex(mix(r))}${toHex(mix(g))}${toHex(mix(b))}`;
}

export function relativeLuminanceFromHex(hex: string): number {
  const { r, g, b } = rgbTripletFromHex(hex);
  const toLinear = (channel: number) => {
    const s = channel / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  };
  return (
    0.2126 * toLinear(r) +
    0.7152 * toLinear(g) +
    0.0722 * toLinear(b)
  );
}

export function isLightHex(hex: string): boolean {
  return relativeLuminanceFromHex(hex) > 0.5;
}

export function contrastRatio(fgHex: string, bgHex: string): number {
  const l1 = relativeLuminanceFromHex(fgHex);
  const l2 = relativeLuminanceFromHex(bgHex);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

const MIN_CHIP_CONTRAST_RATIO = 3;
const MAX_IDENTITY_BLACK_BLEND = 0.95;

function forBlendWeight(
  start: number,
  end: number,
  step: number,
  run: (weight: number) => string | null,
): string | null {
  const steps = Math.max(0, Math.round((end - start) / step));
  for (let i = 0; i <= steps; i += 1) {
    const weight = i === steps ? end : start + i * step;
    const picked = run(weight);
    if (picked) {
      return picked;
    }
  }
  return null;
}

function readableForegroundOnInvertedFill(identityHex: string): string {
  const identity = normalizeHex(identityHex);

  if (!isLightHex(identity)) {
    const light =
      forBlendWeight(0.35, 1, 0.05, (weight) => {
        const fg = blendHexWithWhite(identity, weight);
        return contrastRatio(fg, identity) >= MIN_CHIP_CONTRAST_RATIO ? fg : null;
      }) ?? blendHexWithWhite(identity, 1);
    return light;
  }

  const dark =
    forBlendWeight(0.1, MAX_IDENTITY_BLACK_BLEND, 0.1, (weight) => {
      const fg = blendHexWithBlack(identity, weight);
      return contrastRatio(fg, identity) >= MIN_CHIP_CONTRAST_RATIO ? fg : null;
    }) ?? blendHexWithBlack(identity, MAX_IDENTITY_BLACK_BLEND);
  return dark;
}

/** Readable foreground for accent on a given background. */
export function readableForeground(
  backgroundHex: string,
  identityHex: string,
): string {
  const bg = normalizeHex(backgroundHex);
  const identity = normalizeHex(identityHex);

  if (bg === identity) {
    return readableForegroundOnInvertedFill(identity);
  }

  if (isLightHex(bg)) {
    if (contrastRatio(identity, bg) >= MIN_CHIP_CONTRAST_RATIO) {
      return identity;
    }
    for (let blackWeight = 0.1; blackWeight <= 1; blackWeight += 0.1) {
      const fg = blendHexWithBlack(identity, blackWeight);
      if (contrastRatio(fg, bg) >= MIN_CHIP_CONTRAST_RATIO) {
        return fg;
      }
    }
    return blendHexWithBlack(identity, 0.85);
  }

  let whiteWeight = 0.45;
  let fg = blendHexWithWhite(identity, whiteWeight);
  while (contrastRatio(fg, bg) < MIN_CHIP_CONTRAST_RATIO && whiteWeight < 1) {
    whiteWeight = Math.min(1, whiteWeight + 0.05);
    fg = blendHexWithWhite(identity, whiteWeight);
  }
  return fg;
}

/** Canonical editor/terminal background per built-in theme id. */
const THEME_SURFACE_BY_ID: Record<string, string> = {
  "solarized-dark": "#002b36",
  "solarized-light": "#fdf6e3",
  "gruvbox-dark": "#282828",
  "gruvbox-light": "#fbf1c7",
  "tokyo-night-dark": "#1a1b26",
  "tokyo-night-light": "#e6e7ed",
  "dracula-dark": "#282a36",
  "dracula-light": "#fffbeb",
  "catppuccin-dark": "#1e1e2e",
  "catppuccin-light": "#eff1f5",
  // Aliases
  dracula: "#282a36",
  "catppuccin-mocha": "#1e1e2e",
  "catppuccin-latte": "#eff1f5",
};

export function themeSurfaceHex(theme: LogTheme): string {
  const mapped = THEME_SURFACE_BY_ID[theme.id];
  if (mapped) {
    return mapped;
  }
  if (theme.background === "light") {
    return "#fdf6e3";
  }
  return "#002b36";
}

/** Theme box bar: `roles.box` as background with a readable foreground. */
export function boxChromeColors(theme: LogTheme): ChromeColors {
  const fallback =
    theme.background === "light" ? DEFAULT_BOX_BG_LIGHT : DEFAULT_BOX_BG_DARK;
  const background = normalizeHex(theme.roles?.box ?? fallback);
  const preferred =
    theme.roles?.message ??
    (isLightHex(background) ? SURFACE_INK_HEX : SURFACE_WHITE_HEX);
  return {
    background,
    foreground: readableForeground(background, preferred),
  };
}

function chipBackgroundHex(
  identityHex: string,
  chrome: ChipChrome,
  surface: string,
): string {
  const identity = normalizeHex(identityHex);
  switch (chrome) {
    case "faint":
      return blendHexWithWhite(identity, 1 - FAINT_BG_COLOR_WEIGHT);
    case "fill":
      return blendHexWithWhite(identity, 1 - FILL_BG_COLOR_WEIGHT);
    case "inverted":
    case "prefix":
      return identity;
    case "fg":
      return surface;
    default: {
      const _exhaustive: never = chrome;
      return _exhaustive;
    }
  }
}

export function chromeColors(
  identityHex: string,
  chrome: ChipChrome,
  theme: LogTheme,
): ChromeColors {
  const identity = normalizeHex(identityHex);
  const surface = themeSurfaceHex(theme);

  switch (chrome) {
    case "fg":
      return {
        background: surface,
        foreground: readableForeground(surface, identity),
      };
    case "fill": {
      // Light subject chips: 25% identity hue on white (not flat #fff).
      const background = chipBackgroundHex(identity, "fill", surface);
      return {
        background,
        foreground: readableForeground(background, identity),
      };
    }
    case "faint": {
      const background = chipBackgroundHex(identity, "faint", surface);
      return {
        background,
        foreground: readableForeground(background, identity),
      };
    }
    case "inverted":
    case "prefix":
      return {
        background: identity,
        foreground: readableForeground(identity, identity),
      };
    default: {
      const _exhaustive: never = chrome;
      return _exhaustive;
    }
  }
}
