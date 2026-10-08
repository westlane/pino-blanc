import { describe, expect, it } from "vitest";
import { buildBoxSpans } from "../src/format/box-spans.js";
import { renderBoxBlock } from "../src/format/render-box.js";
import { stripAnsiForPlainOutput } from "../src/render/plain.js";

describe("box spans", () => {
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
    // box.complex: pad + title + pad + subtitle + pad
    const barLines = plain.split("\n").filter((row) => row.length === 48);
    expect(barLines.length).toBe(5);
    expect(barLines.some((row) => row.includes("pino-blanc"))).toBe(true);
    expect(barLines.some((row) => row.includes("@lucky-aphid"))).toBe(true);
    if (rendered.mode === "ansi") {
      expect(rendered.line).toMatch(/48;5;\d+/);
    }
  });
});
