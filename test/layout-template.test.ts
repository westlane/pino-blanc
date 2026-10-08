import { describe, expect, it } from "vitest";
import {
  CLASSIC_LOG_LAYOUT,
  COMPLEX_LAYOUT,
  DEFAULT_LAYOUT,
  DEFAULT_LOG_LAYOUT,
  resolveLayoutTemplate,
} from "../src/layout/presets.js";
import { spansToPlain, formatStandardSpans } from "../src/layout/line.js";
import { formatLayoutSpans, parseLogLayout } from "../src/layout/template.js";

describe("log layout template", () => {
  it("parses literals and fields", () => {
    expect(parseLogLayout("%level% %message%")).toEqual([
      { kind: "field", field: "level", align: "left" },
      { kind: "literal", text: " " },
      { kind: "field", field: "message", align: "left" },
    ]);
  });

  it("rejects unknown placeholders", () => {
    expect(() => parseLogLayout("%nope%")).toThrow(/Unknown log layout field/);
  });

  it("default places module in the final column", () => {
    const plain = spansToPlain(
      formatLayoutSpans(DEFAULT_LOG_LAYOUT, {
        level: "info",
        module: "api",
        message: "hello world",
      }),
    );
    expect(plain).toMatch(/^INFO\s+hello world\s+\[\s*api\s*\]/);
    expect(plain.trimEnd()).toMatch(/\[\s*api\s*\]\s*$/);
  });

  it("reserves emoji column width when template includes %emoji%", () => {
    const withSlot = spansToPlain(
      formatLayoutSpans(DEFAULT_LOG_LAYOUT, {
        level: "info",
        module: "api",
        message: "x",
      }),
    );
    const noSlot = spansToPlain(
      formatLayoutSpans("%level% %message% %module%", {
        level: "info",
        module: "api",
        message: "x",
      }),
    );
    expect(withSlot.length).toBeGreaterThan(noSlot.length);
    expect(withSlot).toMatch(/^INFO\s+ {4}/);
  });

  it("complex layout omits level and keeps module trailing", () => {
    const plain = spansToPlain(
      formatLayoutSpans(CLASSIC_LOG_LAYOUT, {
        level: "info",
        module: "api",
        message: "hello world",
      }),
    );
    expect(plain).not.toMatch(/^INFO/);
    expect(plain).toMatch(/\[\s*api\s*\]/);
    expect(plain).toContain("hello world");
  });

  it("%event% is an alias for %message%", () => {
    const ctx = { level: "info" as const, module: "api", message: "hello" };
    const fromMessage = spansToPlain(
      formatLayoutSpans("%level% %message%", ctx),
    );
    const fromEvent = spansToPlain(
      formatLayoutSpans("%level% %event%", ctx),
    );
    expect(fromEvent).toBe(fromMessage);
  });

  it("resolveLayoutTemplate accepts preset ids", () => {
    expect(resolveLayoutTemplate(COMPLEX_LAYOUT).split("\n")[0]).toBe(CLASSIC_LOG_LAYOUT);
    expect(resolveLayoutTemplate(DEFAULT_LAYOUT).split("\n")[0]).toBe(DEFAULT_LOG_LAYOUT);
    expect(resolveLayoutTemplate("module-right").split("\n")[0]).toBe(DEFAULT_LOG_LAYOUT);
    expect(resolveLayoutTemplate("emoji-module").split("\n")[0]).toBe(CLASSIC_LOG_LAYOUT);
    expect(resolveLayoutTemplate(DEFAULT_LAYOUT)).toMatch(/%m(?:eta|t)%/);
    expect(resolveLayoutTemplate("%level% %message%")).toBe("%level% %message%");
  });

  it("formatStandardSpans uses default vs complex", () => {
    const plain = spansToPlain(formatStandardSpans("info", "api", "hello world"));
    const complex = spansToPlain(
      formatStandardSpans("info", "api", "hello world", COMPLEX_LAYOUT),
    );
    expect(plain).not.toBe(complex);
    expect(plain).toMatch(/^INFO/);
    expect(complex).not.toMatch(/^INFO/);
    expect(complex).toMatch(/\[.*api.*\]/);
    expect(complex).toContain("hello world");
  });
});
