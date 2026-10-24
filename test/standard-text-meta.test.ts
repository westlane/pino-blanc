import { describe, expect, it } from "vitest";
import { formatStandardSpans, spansToPlain } from "../src/layout/line.js";
import { COMPLEX_LAYOUT } from "../src/layout/presets.js";
import { renderAnsi } from "../src/render/ansi.js";
import { createTintResolver, resolveTheme } from "../src/color/theme.js";

describe("standard text stacked JSON meta", () => {
  it("row 2 compact JSON uses multiple syntax colors", () => {
    const theme = resolveTheme("solarized-dark");
    const tint = createTintResolver(theme);
    const spans = formatStandardSpans(
      "trace",
      "host-set",
      "host load complete",
      COMPLEX_LAYOUT,
      undefined,
      { normalizedKey: "d5TU", did: "d5TU" },
    );
    const plain = spansToPlain(spans);
    const lines = plain.split("\n");
    expect(lines).toHaveLength(2);
    expect(lines[0]).toContain("host load complete");
    expect(lines[1]?.trim()).toBe('{"normalizedKey":"d5TU","did":"d5TU"}');

    const tintedKeys = new Set(
      spans.filter((s) => s.tintKey?.startsWith("json:")).map((s) => s.tintKey),
    );
    expect(tintedKeys.has("json:key")).toBe(true);
    expect(tintedKeys.has("json:string")).toBe(true);
    expect(tintedKeys.has("json:punct")).toBe(true);

    const line = renderAnsi(spans, theme, tint, "trace", true, { ansiMode: "truecolor" });
    const row2 = line.split("\n")[1] ?? "";
    const fgCodes = [...row2.matchAll(/\u001B\[38;2;\d+;\d+;\d+m/g)].map((m) => m[0]);
    expect(new Set(fgCodes).size).toBeGreaterThanOrEqual(2);
  });
});
