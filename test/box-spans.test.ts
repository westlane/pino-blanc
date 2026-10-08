import { describe, expect, it } from "vitest";
import { bannerLogSpans } from "../src/format/banner.js";
import { buildBoxSpans } from "../src/format/box-spans.js";
import { renderBoxBlock } from "../src/format/render-box.js";
import { stripAnsiForPlainOutput } from "../src/render/plain.js";

describe("box spans", () => {
  it("keeps every box at layout.yml frame width", () => {
    const short = buildBoxSpans({ boxLayout: "default", title: "short" });
    const long = buildBoxSpans({
      boxLayout: "default",
      title: "createLogger (in-process pretty, syncPretty) – live NDJSON stream",
    });
    const shortBars = short.filter((s) => s.role === "banner").map((s) => s.text);
    const longBars = long.filter((s) => s.role === "banner").map((s) => s.text);
    expect(shortBars).toHaveLength(3);
    expect(longBars).toHaveLength(3);
    for (const row of [...shortBars, ...longBars]) {
      expect(row.length).toBe(48);
    }
  });

  it("renders box.complex with padding bands + identity subtitle", () => {
    const spans = buildBoxSpans({
      boxLayout: "complex",
      title: "pino-blanc",
      version: "1.0.0",
      level: "info",
      subtitle: "@lucky-aphid",
      barWidth: 48,
      identityTintKey: "did:user:z6Mktest",
      identityChrome: "inverted",
    });

    const prev = process.env.FORCE_COLOR;
    process.env.FORCE_COLOR = "1";
    delete process.env.NO_COLOR;
    const rendered = renderBoxBlock(spans, {
      colorize: (id, fallback) =>
        id.startsWith("did:") ? "#c71585" : fallback,
    });
    if (prev === undefined) {
      delete process.env.FORCE_COLOR;
    } else {
      process.env.FORCE_COLOR = prev;
    }
    expect(rendered.mode === "ansi" || rendered.mode === "plain").toBe(true);
    const line =
      rendered.mode === "ansi"
        ? rendered.line
        : rendered.mode === "plain"
          ? rendered.line
          : "";
    const plain = stripAnsiForPlainOutput(line);
    expect(plain).toContain("pino-blanc v1.0.0 - info level");
    expect(plain).toContain("@lucky-aphid");
    // box.complex: pad + title + pad + pad + subtitle + pad
    const barLines = plain.split("\n").filter((row) => row.length === 48);
    expect(barLines.length).toBe(6);
    expect(barLines.some((row) => row.includes("pino-blanc"))).toBe(true);
    expect(barLines.some((row) => row.includes("@lucky-aphid"))).toBe(true);
    if (rendered.mode === "ansi") {
      expect(rendered.line).toMatch(/48;5;\d+/);
    }
  });

  it("two-content banner keeps first section white (app), color pads above subtitle", () => {
    const spans = bannerLogSpans({ title: "levels", subtitle: "all" });
    const bars = spans.filter((s) => s.role === "banner" || s.role === "box");
    expect(bars.length).toBe(6);
    // pad + title → white; pads above subtitle + subtitle + pad → theme box
    expect(bars[0]?.role).toBe("banner");
    expect(bars[0]?.bannerChrome).toBe("app");
    expect(bars[1]?.role).toBe("banner");
    expect(bars[1]?.bannerChrome).toBe("app");
    expect(bars[2]?.role).toBe("box");
    expect(bars[3]?.role).toBe("box");
    expect(bars[4]?.role).toBe("box");
    expect(bars[5]?.role).toBe("box");
  });

  it("single-content banner stays theme box color on every band", () => {
    const spans = bannerLogSpans({ title: "solo" });
    const bars = spans.filter((s) => s.role === "banner" || s.role === "box");
    expect(bars.length).toBe(3);
    expect(bars.every((s) => s.role === "box")).toBe(true);
  });
});
