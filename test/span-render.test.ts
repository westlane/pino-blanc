import { describe, expect, it } from "vitest";
import { formatStandardSpans } from "../src/layout/line.js";
import { renderAnsi } from "../src/render/ansi.js";
import { resolveSpanHex } from "../src/render/span.js";
import { createTintResolver, resolveTheme } from "../src/color/theme.js";

describe("resolveSpanHex", () => {
  const theme = resolveTheme("solarized-dark");
  const tint = createTintResolver(theme);

  it("warn and error paint module + message with level color", () => {
    const spans = formatStandardSpans("warn", "demo", "slow query");
    const ctx = { theme, tint, level: "warn", options: {} };
    const warnHex = theme.levels.warn;
    const level = spans.find((s) => s.role === "level");
    const module = spans.find((s) => s.role === "module");
    const message = spans.find((s) => s.role === "message" && s.text.includes("slow"));
    expect(resolveSpanHex(level!, ctx)).toBe(warnHex);
    expect(resolveSpanHex(module!, ctx)).toBe(warnHex);
    expect(resolveSpanHex(message!, ctx)).toBe(warnHex);
  });

  it("info keeps module tint from tintKey", () => {
    const spans = formatStandardSpans("info", "demo", "ready");
    const ctx = { theme, tint, level: "info", options: {} };
    const moduleHex = tint.resolve("demo");
    const module = spans.find((s) => s.role === "module");
    const message = spans.find((s) => s.role === "message" && s.text.includes("ready"));
    expect(resolveSpanHex(module!, ctx)).toBe(moduleHex);
    expect(resolveSpanHex(message!, ctx)).toBe(theme.roles?.message);
  });

  it("error line uses one foreground color for the whole row", () => {
    const spans = formatStandardSpans("error", "demo", "failed");
    const line = renderAnsi(spans, theme, tint, "error", true, {});
    const codes = [...line.matchAll(/\u001B\[38;2;\d+;\d+;\d+m/g)].map((m) => m[0]);
    expect(codes.length).toBeGreaterThan(1);
    expect(new Set(codes).size).toBe(1);
  });
});
