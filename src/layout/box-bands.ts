import { resolveBoxLayout } from "./box-presets.js";

export type BoxBandFields = {
  title?: string | undefined;
  version?: string | undefined;
  level?: string | undefined;
  subtitle?: string | undefined;
};

type BoxToken =
  | "title"
  | "tx"
  | "version"
  | "ver"
  | "lv"
  | "level"
  | "subtitle"
  | "sub";

const BAND_TOKEN_RE = /%(title|tx|version|ver|lv|level|subtitle|sub)%/g;

/** Strip drawing edge pad (`---` / spaces); leftover is the fillable content pattern. */
export function boxBandContentPattern(bandInner: string): string {
  return bandInner.replace(/^[-\s]+/, "").replace(/[-\s]+$/, "");
}

/**
 * Hyphen/space-only `[----…]` bands in layout.yml are padding rows
 * (empty tinted bars above/below content).
 */
export function isBoxPaddingBand(bandInner: string): boolean {
  return boxBandContentPattern(bandInner).length === 0;
}

/** Content bands only (skips hyphen-only padding rows). */
export function boxContentBands(bands: string[]): string[] {
  return bands.filter((band) => !isBoxPaddingBand(band));
}

function formatVersion(version: string | undefined): string {
  if (!version) {
    return "";
  }
  const trimmed = version.trim();
  if (!trimmed) {
    return "";
  }
  return /^v/i.test(trimmed) ? trimmed : `v${trimmed}`;
}

function tokenValue(name: BoxToken, fields: BoxBandFields): string {
  switch (name) {
    case "title":
    case "tx":
      return fields.title?.trim() ?? "";
    case "version":
    case "ver":
      return formatVersion(fields.version);
    case "lv":
    case "level":
      return fields.level?.trim() ?? "";
    case "subtitle":
    case "sub":
      return fields.subtitle?.trim() ?? "";
    default: {
      const _never: never = name;
      return _never;
    }
  }
}

/** Fill a box-band inner (from layout.yml) and return the display text (no edge dashes). */
export function formatBoxBandText(bandInner: string, fields: BoxBandFields): string {
  const pattern = boxBandContentPattern(bandInner);
  return pattern.replace(BAND_TOKEN_RE, (_, name: string) =>
    tokenValue(name as BoxToken, fields),
  );
}

export type BoxBandLines = {
  titleLine: string;
  subtitleLine: string;
  /** True when the preset has a second content band (e.g. `complex`). */
  hasSubtitleBand: boolean;
  minBarWidth: number;
};

/** @deprecated Prefer {@link BoxBandLines}. */
export type SessionBannerBandLines = BoxBandLines;

/**
 * Title (+ optional subtitle) lines from a `config/layout.yml` box preset.
 * Padding bands (`[----…]`) are skipped when picking content.
 * @param boxLayout preset id — `default`, `complex`, or any name in layout.yml
 */
export function formatBoxBandLines(
  fields: BoxBandFields,
  boxLayout?: string,
): BoxBandLines {
  const preset = resolveBoxLayout(boxLayout);
  const content = boxContentBands(preset.bands);
  const titleBand = content[0] ?? "%title%";
  const subtitleBand = content[1];
  return {
    titleLine: formatBoxBandText(titleBand, fields),
    subtitleLine: subtitleBand
      ? formatBoxBandText(subtitleBand, fields)
      : (fields.subtitle?.trim() ?? ""),
    hasSubtitleBand: Boolean(subtitleBand),
    minBarWidth: preset.width,
  };
}

/** @deprecated Prefer {@link formatBoxBandLines}. */
export function formatSessionBannerBandLines(
  fields: BoxBandFields,
  boxLayout?: string,
): BoxBandLines {
  return formatBoxBandLines(fields, boxLayout);
}
