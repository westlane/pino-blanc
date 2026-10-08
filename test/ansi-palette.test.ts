import { describe, expect, it } from "vitest";
import { resolveAnsiMode } from "../src/color/gate.js";
import { hexToAnsiFg } from "../src/color/ansi.js";

describe("ansi palette", () => {
  it("defaults to truecolor in auto mode", () => {
    const prev = process.env.PINO_BLANC_ANSI;
    delete process.env.PINO_BLANC_ANSI;
    expect(resolveAnsiMode({ ansiMode: "auto" })).toBe("truecolor");
    if (prev === undefined) {
      delete process.env.PINO_BLANC_ANSI;
    } else {
      process.env.PINO_BLANC_ANSI = prev;
    }
  });

  it("emits 38;5 sequences in 256 mode", () => {
    const seq = hexToAnsiFg("#b58900", false, "256");
    expect(seq).toContain("38;5;");
  });
});
