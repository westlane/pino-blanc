import { describe, expect, it } from "vitest";
import {
  boxChromeColors,
  chromeColors,
  contrastRatio,
  readableForeground,
} from "../src/color/chrome.js";
import { resolveTheme } from "../src/color/theme.js";
import { renderBannerLine } from "../src/format/banner.js";
import { stripAnsiForPlainOutput } from "../src/render/plain.js";

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

  it("fill chip tints toward white (not flat #fff)", () => {
    const accent = "#956cb3";
    const fill = chromeColors(accent, "fill", solarizedDark);
    expect(fill.background.toLowerCase()).not.toBe("#ffffff");
    expect(contrastRatio(fill.foreground, fill.background)).toBeGreaterThan(3);
  });

  it("readableForeground meets contrast on dark surfaces", () => {
    const fg = readableForeground("#002b36", "#073642");
    expect(contrastRatio(fg, "#002b36")).toBeGreaterThan(3);
  });

  it("box chrome uses theme roles.box as background", () => {
    const colors = boxChromeColors(solarizedDark);
    expect(colors.background.toLowerCase()).toBe(
      (solarizedDark.roles?.box ?? "").toLowerCase(),
    );
    expect(contrastRatio(colors.foreground, colors.background)).toBeGreaterThan(3);
  });

  it("renderBannerLine emits box.complex title + subtitle at fixed width", () => {
    const prev = process.env.FORCE_COLOR;
    process.env.FORCE_COLOR = "1";
    delete process.env.NO_COLOR;
    const line = renderBannerLine(
      { title: "pino-blanc", subtitle: "live" },
      "solarized-dark",
      { forceColor: true, ansiMode: "truecolor" },
    );
    const long = renderBannerLine(
      {
        title: "createLogger with a very long title that must truncate",
        subtitle: "ndjson-peer",
      },
      "solarized-dark",
      { forceColor: true, ansiMode: "truecolor" },
    );
    if (prev === undefined) {
      delete process.env.FORCE_COLOR;
    } else {
      process.env.FORCE_COLOR = prev;
    }
    const plain = stripAnsiForPlainOutput(line);
    const longPlain = stripAnsiForPlainOutput(long);
    expect(plain).toContain("pino-blanc");
    expect(plain).toContain("live");
    // box.complex: pad + title + pad + pad + subtitle + pad
    const bars = plain.split("\n").filter((row) => row.length === 48);
    const longBars = longPlain.split("\n").filter((row) => row.length === 48);
    expect(bars.length).toBe(6);
    expect(longBars.length).toBe(6);
    expect(bars[1]).toContain("pino-blanc");
    expect(bars[4]).toContain("live");
    expect(longBars[1]?.includes("...")).toBe(true);
    expect(line).toMatch(/48;2;\d+;\d+;\d+/);
  });
});
