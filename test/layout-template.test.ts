import { describe, expect, it } from "vitest";
import {
  CLASSIC_LOG_LAYOUT,
  DEFAULT_LOG_LAYOUT,
  resolveLayoutTemplate,
} from "../layouts/index.js";
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
    expect(plain).toMatch(/^INFO\s+hello world\s+\[api\]/);
    expect(plain.trimEnd()).toMatch(/\[api\]\s*$/);
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
      formatLayoutSpans("%level% %message% %module:right%", {
        level: "info",
        module: "api",
        message: "x",
      }),
    );
    expect(withSlot.length).toBeGreaterThan(noSlot.length);
    expect(withSlot).toMatch(/^INFO\s+ {4}/);
  });

  it("classic layout matches legacy column order", () => {
    const plain = spansToPlain(
      formatLayoutSpans(CLASSIC_LOG_LAYOUT, {
        level: "info",
        module: "api",
        message: "hello world",
      }),
    );
    expect(plain).toBe("INFO   [api]              hello world");
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
    expect(resolveLayoutTemplate("classic")).toBe(CLASSIC_LOG_LAYOUT);
    expect(resolveLayoutTemplate("default")).toBe(DEFAULT_LOG_LAYOUT);
    expect(resolveLayoutTemplate("%level% %message%")).toBe("%level% %message%");
  });

  it("formatStandardSpans uses default preset", () => {
    const plain = spansToPlain(formatStandardSpans("info", "api", "hello world"));
    const classic = spansToPlain(
      formatStandardSpans("info", "api", "hello world", "classic"),
    );
    expect(plain).not.toBe(classic);
    expect(classic).toBe("INFO   [api]              hello world");
  });
});
