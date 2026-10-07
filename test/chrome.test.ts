import { describe, expect, it } from "vitest";
import {
  chromeColors,
  contrastRatio,
  readableForeground,
} from "../src/color/chrome.js";
import { resolveTheme } from "../src/color/theme.js";

const solarizedDark = resolveTheme("solarized-dark");

describe("chrome", () => {
  it("picks readable foreground on inverted fill", () => {
    const dark = "#268bd2";
    const colors = chromeColors(dark, "inverted", solarizedDark);
    expect(contrastRatio(colors.foreground, colors.background)).toBeGreaterThan(3);
  });

  it("faint chip keeps readable contrast", () => {
    const accent = "#d33682";
    const faint = chromeColors(accent, "faint", solarizedDark);
    expect(contrastRatio(faint.foreground, faint.background)).toBeGreaterThan(3);
  });

  it("readableForeground meets contrast on dark surfaces", () => {
    const fg = readableForeground("#002b36", "#073642");
    expect(contrastRatio(fg, "#002b36")).toBeGreaterThan(3);
  });
});
