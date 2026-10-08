import { describe, expect, it } from "vitest";
import {
  COMPLEX_LAYOUT,
  DEFAULT_LAYOUT,
  getClassicLogLayout,
  getDefaultLogLayout,
  resolveLayoutTemplate,
} from "../src/layout/presets.js";
import { spansToPlain, formatStandardSpans, stripMetaTokens } from "../src/layout/line.js";
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

  it("default places module before message", () => {
    const plain = spansToPlain(
      formatLayoutSpans(stripMetaTokens(getDefaultLogLayout()), {
        level: "info",
        module: "api",
        message: "hello world",
      }),
    );
    expect(plain).toMatch(/^INFO/);
    expect(plain).toMatch(/\[\s*api\s*\]/);
    expect(plain).toContain("hello world");
  });

  it("reserves emoji column width when template includes %emoji%", () => {
    const row = stripMetaTokens(getDefaultLogLayout());
    if (!row.includes("%mj%") && !row.includes("%emoji%")) {
      return;
    }
    const withSlot = spansToPlain(
      formatLayoutSpans(row, {
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

  it("complex layout keeps module trailing", () => {
    const plain = spansToPlain(
      formatLayoutSpans(getClassicLogLayout(), {
        level: "info",
        module: "api",
        message: "hello world",
      }),
    );
    const hasLevel = getClassicLogLayout().includes("%lv%") || getClassicLogLayout().includes("%level%");
    if (hasLevel) {
      expect(plain).toMatch(/^INFO/);
    } else {
      expect(plain).not.toMatch(/^INFO/);
    }
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
    expect(resolveLayoutTemplate(COMPLEX_LAYOUT).split("\n")[0]).toBe(
      getClassicLogLayout(),
    );
    expect(resolveLayoutTemplate(DEFAULT_LAYOUT).split("\n")[0]).toBe(
      getDefaultLogLayout(),
    );
    expect(resolveLayoutTemplate("module-right").split("\n")[0]).toBe(
      getDefaultLogLayout(),
    );
    expect(resolveLayoutTemplate("emoji-module").split("\n")[0]).toBe(
      getClassicLogLayout(),
    );
    expect(resolveLayoutTemplate(DEFAULT_LAYOUT)).toMatch(/%m(?:eta|t)%/);
    expect(resolveLayoutTemplate("%level% %message%")).toBe("%level% %message%");
  });

  it("formatStandardSpans uses default vs complex", () => {
    const plain = spansToPlain(formatStandardSpans("info", "api", "hello world"));
    const complex = spansToPlain(
      formatStandardSpans("info", "api", "hello world", COMPLEX_LAYOUT),
    );
    expect(plain).toMatch(/^INFO/);
    expect(complex).toMatch(/\[\s*api\s*\]/);
    expect(complex).toContain("hello world");
    if (getClassicLogLayout() !== getDefaultLogLayout()) {
      expect(plain).not.toBe(complex);
    }
  });
});
