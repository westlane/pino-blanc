import { describe, expect, it } from "vitest";
import { buildSessionBannerSpans } from "../src/format/session-banner.js";
import { renderSessionBannerBlock } from "../src/format/render-session-banner.js";
import { stripAnsiForPlainOutput } from "../src/render/plain.js";

describe("session banner spans", () => {
  it("renders DID-tinted identity bar with app header", () => {
    const spans = buildSessionBannerSpans({
      appLine: "pino-blanc v1.0.0 - info level",
      aliasLine: "@lucky-aphid",
      barWidth: 48,
      identityTintKey: "did:user:z6Mktest",
      identityChrome: "inverted",
    });
    const prev = process.env.FORCE_COLOR;
    process.env.FORCE_COLOR = "1";
    delete process.env.NO_COLOR;
    const rendered = renderSessionBannerBlock(spans, {
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
    expect(plain).toContain("pino-blanc v1.0.0");
    expect(plain).toContain("@lucky-aphid");
    const barLines = plain.split("\n").filter((row) => row.length === 48);
    expect(barLines.length).toBeGreaterThanOrEqual(5);
    expect(barLines.some((row) => row.includes("pino-blanc"))).toBe(true);
    expect(barLines.some((row) => row.includes("@lucky-aphid"))).toBe(true);
    if (rendered.mode === "ansi") {
      expect(rendered.line).toMatch(/48;2;199;21;133/);
    }
  });
});
