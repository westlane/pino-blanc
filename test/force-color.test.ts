import { describe, expect, it } from "vitest";
import { formatPinoLogLine } from "../src/node/format-record.js";

describe("forceColor", () => {
  it("emits ANSI when NO_COLOR is set (pretty default)", () => {
    const prev = process.env.NO_COLOR;
    const prevPlain = process.env.PINO_BLANC_PLAIN;
    delete process.env.PINO_BLANC_PLAIN;
    process.env.NO_COLOR = "1";
    delete process.env.FORCE_COLOR;
    const line = formatPinoLogLine(
      { level: 30, msg: "hello", module: "api", blancEvent: true },
      { options: { theme: "solarized-dark" } },
      false,
    );
    if (prev === undefined) {
      delete process.env.NO_COLOR;
    } else {
      process.env.NO_COLOR = prev;
    }
    if (prevPlain === undefined) {
      delete process.env.PINO_BLANC_PLAIN;
    } else {
      process.env.PINO_BLANC_PLAIN = prevPlain;
    }
    expect(line.includes("\u001B")).toBe(true);
    expect(line).toContain("hello");
  });

  it("strips ANSI when PINO_BLANC_PLAIN=1", () => {
    const prev = process.env.PINO_BLANC_PLAIN;
    process.env.PINO_BLANC_PLAIN = "1";
    const line = formatPinoLogLine(
      { level: 30, msg: "hello", module: "api", blancEvent: true },
      { options: {} },
      false,
    );
    if (prev === undefined) {
      delete process.env.PINO_BLANC_PLAIN;
    } else {
      process.env.PINO_BLANC_PLAIN = prev;
    }
    expect(line.includes("\u001B")).toBe(false);
  });
});
