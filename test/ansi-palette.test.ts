import { describe, expect, it } from "vitest";
import { resolveAnsiMode } from "../src/color/gate.js";
import { hexToAnsiFg } from "../src/color/ansi.js";

describe("ansi palette", () => {
  it("defaults to 256 when COLORTERM is unset", () => {
    const prev = process.env.COLORTERM;
    delete process.env.COLORTERM;
    delete process.env.PINO_BLANC_ANSI;
    expect(resolveAnsiMode({ ansiMode: "auto" })).toBe("256");
    if (prev === undefined) {
      delete process.env.COLORTERM;
    } else {
      process.env.COLORTERM = prev;
    }
  });

  it("emits 38;5 sequences in 256 mode", () => {
    const seq = hexToAnsiFg("#b58900", false, "256");
    expect(seq).toContain("38;5;");
  });
});
