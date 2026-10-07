import { chromeColors } from "../color/chrome.js";
import { hexToCssChrome } from "../color/css.js";
import { wrapAnsiChrome } from "../color/ansi.js";
import { displayWidth } from "../layout/width.js";
import type { BannerChrome, LogSpan, ResolvedAnsiPalette } from "../types.js";
import type { SpanRenderContext } from "./span.js";
import { resolveIdentityHex } from "./span.js";

const APP_BAR_BG = "#ffffff";
const APP_BAR_FG = "#212121";

const BANNER_BAR_CSS_BASE = [
  "font-family: monospace",
  "display: block",
  "box-sizing: border-box",
  "text-align: center",
  "margin-left: auto",
  "margin-right: auto",
  "border-radius: 0",
  "line-height: 1.4",
  "white-space: pre",
  "padding: 2px 0",
].join("; ");

function bannerColors(
  span: LogSpan,
  ctx: SpanRenderContext,
): { background: string; foreground: string; bold: boolean } {
  const chrome: BannerChrome = span.bannerChrome ?? "app";
  if (chrome === "app") {
    return { background: APP_BAR_BG, foreground: APP_BAR_FG, bold: true };
  }
  const identity = resolveIdentityHex(span, ctx.tint);
  if (!identity) {
    return { background: APP_BAR_BG, foreground: APP_BAR_FG, bold: false };
  }
  const colors = chromeColors(identity, chrome, ctx.theme);
  const bold = chrome === "inverted" || chrome === "prefix";
  return { background: colors.background, foreground: colors.foreground, bold };
}

export function renderBannerBarAnsi(
  span: LogSpan,
  ctx: SpanRenderContext,
  palette: ResolvedAnsiPalette,
): string {
  const { background, foreground, bold } = bannerColors(span, ctx);
  return wrapAnsiChrome(span.text, background, foreground, bold, palette);
}

export function renderBannerBarCss(span: LogSpan, ctx: SpanRenderContext): string {
  const { background, foreground, bold } = bannerColors(span, ctx);
  const widthCh = Math.max(displayWidth(span.text), 1);
  return `${BANNER_BAR_CSS_BASE}; width: ${widthCh}ch; ${hexToCssChrome(background, foreground, bold)}`;
}
