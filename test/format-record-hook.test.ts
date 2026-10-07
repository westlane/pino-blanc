import { describe, expect, it } from "vitest";
import {
  CONSOLE_TRIPLE_COLOR_RESET,
  consoleLeadingNewlineUnless,
} from "../src/format/console-output.js";
import { defineFormatRecord } from "../src/format/define-format-record.js";
import { formatPinoLogLine } from "../src/node/format-record.js";
import type { FormatRecord, LogSpan } from "../src/types.js";

describe("formatRecord hook", () => {
  it("formatRecord string bypasses default spans", () => {
    const formatRecord: FormatRecord = () => "CUSTOM_LINE";
    const line = formatPinoLogLine(
      { level: 30, msg: "ignored", module: "api" },
      {
        options: {
          formatRecord,
          consoleColorReset: "triple",
        },
      },
    );
    expect(line).toBe(`CUSTOM_LINE${CONSOLE_TRIPLE_COLOR_RESET}`);
    expect(line).not.toContain("INFO");
  });

  it("formatRecord null falls back to standard spans", () => {
    const formatRecord: FormatRecord = (_record, ctx) => ctx.defaultSpans;
    const line = formatPinoLogLine(
      { level: 30, msg: "hello", module: "api" },
      { options: { formatRecord } },
      true,
    );
    expect(line).toContain("hello");
    expect(line).toContain("INFO");
  });

  it("consoleLeadingNewline respects record meta", () => {
    const line = formatPinoLogLine(
      { level: 30, msg: "x", module: "api", _noLeadingNewline: true },
      {
        options: {
          formatRecord: () => "LINE",
          consoleLeadingNewline: (record) => record._noLeadingNewline !== true,
        },
      },
    );
    expect(line.startsWith("\n")).toBe(false);
  });

  it("formatRecord empty string yields empty output", () => {
    const line = formatPinoLogLine(
      { level: 30, msg: "x", module: "api" },
      { options: { formatRecord: () => "" } },
    );
    expect(line).toBe("");
  });

  it("defineFormatRecord merges module from ctx", () => {
    const formatRecord = defineFormatRecord((record) => String(record.module));
    const line = formatPinoLogLine(
      { level: 30, msg: "x" },
      {
        options: {
          formatRecord,
        },
      },
      true,
    );
    expect(line).toBe("app");
  });

  it("consoleLeadingNewlineUnless", () => {
    expect(consoleLeadingNewlineUnless({ _noLeadingNewline: true }, "_noLeadingNewline")).toBe(
      false,
    );
    expect(consoleLeadingNewlineUnless({}, "_noLeadingNewline")).toBe(true);
  });

  it("formatRecord LogSpan[] uses render path", () => {
    const spans: LogSpan[] = [
      { text: "A", role: "message" },
      { text: "B", role: "message" },
    ];
    const line = formatPinoLogLine(
      { level: 30, msg: "x", module: "api" },
      { options: { formatRecord: () => spans } },
      true,
    );
    expect(line).toBe("AB");
  });
});
