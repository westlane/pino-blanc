import { formatBoxBandText, isBoxPaddingBand } from "../layout/box-bands.js";
import { resolveBoxLayout } from "../layout/box-presets.js";
import { COMPLEX_LAYOUT } from "../layout/layout-ids.js";
import { centerInBar } from "../layout/center-bar.js";
import type { ChipChrome, LogSpan } from "../types.js";

/** Frame width from `box.default` in layout.yml (live / mtime-cached). */
export function boxMinBarWidth(): number {
  return resolveBoxLayout().width;
}

/** @deprecated Prefer {@link boxMinBarWidth}. */
export function BOX_MIN_BAR_WIDTH(): number {
  return boxMinBarWidth();
}

/** @deprecated Box width is fixed by layout.yml. */
export const BOX_BAR_SIDE_PADDING = 0;

/** @deprecated Use {@link boxMinBarWidth}. */
export const SESSION_BANNER_MIN_BAR_WIDTH = boxMinBarWidth;
/** @deprecated Use {@link BOX_BAR_SIDE_PADDING}. */
export const SESSION_BANNER_BAR_SIDE_PADDING = BOX_BAR_SIDE_PADDING;

export type BoxSpansInput = {
  /** Box preset id — `default` or `complex`, or any name in layout.yml. */
  boxLayout?: string;
  /** App name — fills `%title%`. */
  title?: string;
  /** Semver (with or without `v`) — fills `%version%`. */
  version?: string;
  /** Log level name — fills `%lv%`. */
  level?: string;
  /** Identity / alias — fills `%subtitle%` on complex. */
  subtitle?: string;
  /**
   * Preformatted title band (legacy). Used when `title`/`version`/`level` omitted.
   */
  appLine?: string;
  /** Preformatted subtitle (legacy). Used when `subtitle` omitted. */
  aliasLine?: string;
  /**
   * Optional extra identity row after the preset bands (not in layout.yml).
   */
  didLine?: string;
  barWidth?: number;
  /** DID or alias key for identity-tinted subtitle bands. */
  identityTintKey?: string;
  identityChrome?: ChipChrome;
};

/** @deprecated Prefer {@link BoxSpansInput}. */
export type SessionBannerInput = BoxSpansInput;

function inferBoxLayout(input: BoxSpansInput): string | undefined {
  if (input.boxLayout) {
    return input.boxLayout;
  }
  const wantsComplex =
    input.subtitle !== undefined ||
    input.aliasLine !== undefined ||
    input.version !== undefined ||
    input.level !== undefined ||
    Boolean(input.didLine?.trim());
  return wantsComplex ? COMPLEX_LAYOUT : undefined;
}

function resolveBoxFields(input: BoxSpansInput): {
  title?: string;
  version?: string;
  level?: string;
  subtitle?: string;
  appLine?: string;
} {
  return {
    title: input.title,
    version: input.version,
    level: input.level,
    subtitle: input.subtitle ?? input.aliasLine,
    appLine: input.appLine,
  };
}

/**
 * Box bar width from layout.yml (`box.*.width`).
 * Content length is ignored — all boxes share the configured max width.
 */
export function resolveBoxBarWidth(
  _titleLine?: string,
  _subtitleLine?: string,
  _didLine = "",
  maxWidth = boxMinBarWidth(),
  _sidePadding = BOX_BAR_SIDE_PADDING,
): number {
  return maxWidth;
}

/** @deprecated Prefer {@link resolveBoxBarWidth}. */
export function resolveSessionBannerBarWidth(
  appLine?: string,
  aliasLine?: string,
  didLine = "",
  maxWidth = boxMinBarWidth(),
  sidePadding = BOX_BAR_SIDE_PADDING,
): number {
  return resolveBoxBarWidth(appLine, aliasLine, didLine, maxWidth, sidePadding);
}

function boxRow(
  text: string,
  barWidth: number,
  bannerChrome: ChipChrome | "app",
  tintKey?: string,
): LogSpan {
  return {
    text: centerInBar(text, barWidth),
    role: "banner",
    bannerChrome,
    ...(tintKey ? { tintKey } : {}),
  };
}

function pushBoxRow(spans: LogSpan[], row: LogSpan): void {
  spans.push({ text: "\n", role: "message" });
  spans.push(row);
}

/**
 * Render a `box` preset from layout.yml as full-width tinted bars.
 *
 * Hyphen-only `[----…]` bands are padding rows (empty bars). Content bands
 * fill `%title%` / `%version%` / `%lv%` / `%subtitle%`. First content section
 * uses app chrome (white) with one closer pad beneath; further pads (above
 * subtitle) + later content use identity chrome.
 */
export function buildBoxSpans(input: BoxSpansInput): LogSpan[] {
  const boxLayout = inferBoxLayout(input);
  const preset = resolveBoxLayout(boxLayout);
  const fields = resolveBoxFields(input);
  const hasStructured =
    fields.title !== undefined ||
    fields.version !== undefined ||
    fields.level !== undefined ||
    fields.subtitle !== undefined;

  // Fixed to layout.yml frame width so every box is even; long text truncates.
  const barWidth = input.barWidth ?? preset.width;

  const identityTintKey = input.identityTintKey ?? "";
  const identityChrome = input.identityChrome ?? "inverted";
  const spans: LogSpan[] = [{ text: "\n", role: "message" }];

  let contentOrdinal = 0;
  /** One white closer pad under the first content row; further pads use color. */
  let closedFirstSection = false;
  for (const band of preset.bands) {
    const padding = isBoxPaddingBand(band);
    let chrome: ChipChrome | "app";
    if (padding) {
      if (contentOrdinal === 0) {
        chrome = "app";
      } else if (contentOrdinal === 1 && !closedFirstSection) {
        chrome = "app";
        closedFirstSection = true;
      } else {
        chrome = identityChrome;
      }
    } else {
      chrome = contentOrdinal === 0 ? "app" : identityChrome;
    }

    let text = "";
    if (!padding) {
      if (!hasStructured && contentOrdinal === 0 && fields.appLine) {
        text = fields.appLine;
      } else if (
        !hasStructured &&
        contentOrdinal > 0 &&
        (fields.subtitle || input.aliasLine)
      ) {
        text = fields.subtitle ?? input.aliasLine ?? "";
      } else {
        text = formatBoxBandText(band, {
          title: fields.title,
          version: fields.version,
          level: fields.level,
          subtitle: fields.subtitle,
        });
        if (
          contentOrdinal === 0 &&
          fields.appLine &&
          fields.title === undefined
        ) {
          text = fields.appLine;
        }
      }
      contentOrdinal += 1;
    }

    const tintKey = chrome === "app" ? undefined : identityTintKey || undefined;
    pushBoxRow(spans, boxRow(text, barWidth, chrome, tintKey));
  }

  if (input.didLine?.trim()) {
    pushBoxRow(
      spans,
      boxRow(
        input.didLine,
        barWidth,
        identityChrome,
        identityTintKey || undefined,
      ),
    );
  }

  return spans;
}

/** @deprecated Prefer {@link buildBoxSpans}. */
export function buildSessionBannerSpans(input: BoxSpansInput): LogSpan[] {
  return buildBoxSpans(input);
}
