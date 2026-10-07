import { centerInBar } from "../layout/center-bar.js";
import { displayWidth } from "../layout/width.js";
import type { ChipChrome, LogSpan } from "../types.js";

export const SESSION_BANNER_MIN_BAR_WIDTH = 48;
export const SESSION_BANNER_BAR_SIDE_PADDING = 1;

export type SessionBannerInput = {
  appLine: string;
  aliasLine: string;
  didLine?: string;
  barWidth?: number;
  /** DID or alias key for {@link CreateLoggerOptions.colorTransform}. */
  identityTintKey: string;
  identityChrome: ChipChrome;
};

/** Content-sized bar width (Rally / `resolveSessionBannerBarWidth`). */
export function resolveSessionBannerBarWidth(
  appLine: string,
  aliasLine: string,
  didLine = "",
  minWidth = SESSION_BANNER_MIN_BAR_WIDTH,
  sidePadding = SESSION_BANNER_BAR_SIDE_PADDING,
): number {
  const peak = Math.max(
    displayWidth(appLine),
    displayWidth(aliasLine),
    displayWidth(didLine),
  );
  return Math.max(minWidth, peak + sidePadding * 2);
}

function bannerRow(
  text: string,
  barWidth: number,
  bannerChrome: SessionBannerInput["identityChrome"] | "app",
  tintKey?: string,
): LogSpan {
  return {
    text: centerInBar(text, barWidth),
    role: "banner",
    bannerChrome,
    ...(tintKey ? { tintKey } : {}),
  };
}

function pushBannerRow(spans: LogSpan[], row: LogSpan): void {
  spans.push({ text: "\n", role: "message" });
  spans.push(row);
}

/**
 *  session banner: spacer rows + centered text in fixed-width tinted bars.
 * Each row is its own line (not concatenated on one terminal row).
 */
export function buildSessionBannerSpans(input: SessionBannerInput): LogSpan[] {
  const barWidth =
    input.barWidth ??
    resolveSessionBannerBarWidth(
      input.appLine,
      input.aliasLine,
      input.didLine ?? "",
    );
  const { identityTintKey, identityChrome } = input;
  const appSpacer = () => bannerRow("", barWidth, "app");
  const idSpacer = () => bannerRow("", barWidth, identityChrome, identityTintKey);

  const spans: LogSpan[] = [{ text: "\n", role: "message" }];
  pushBannerRow(spans, appSpacer());
  pushBannerRow(spans, bannerRow(input.appLine, barWidth, "app"));
  pushBannerRow(spans, appSpacer());
  pushBannerRow(spans, idSpacer());
  pushBannerRow(spans, bannerRow(input.aliasLine, barWidth, identityChrome, identityTintKey));
  if (input.didLine?.trim()) {
    pushBannerRow(
      spans,
      bannerRow(input.didLine, barWidth, identityChrome, identityTintKey),
    );
  }
  pushBannerRow(spans, idSpacer());
  return spans;
}
