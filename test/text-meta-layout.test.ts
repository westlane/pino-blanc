import { describe, expect, it } from "vitest";
import { formatStandardSpans, spansToPlain, stripMetaTokens } from "../src/layout/line.js";
import { displayWidth } from "../src/layout/width.js";

describe("text layout meta", () => {
  it("strips meta tokens before field parse", () => {
    expect(stripMetaTokens("[%lv%  ] [%ms% ----] [%mt%]")).toBe(
      "[%lv%  ] [%ms% ----]",
    );
    expect(stripMetaTokens("[%mt]")).toBe("");
  });

  it("default text layout keeps inline meta on one line", () => {
    const plain = spansToPlain(
      formatStandardSpans(
        "info",
        "ndjson-peer",
        "ws.frame",
        "default",
        undefined,
        { seq: 12, bytes: 251, path: "/ws/" },
      ),
    );
    expect(plain.includes("\n")).toBe(false);
    expect(plain).toContain("ws.frame");
    expect(plain).toContain('"seq"');
    expect(plain).toContain("[");
    expect(plain.indexOf("ws.frame")).toBeLessThan(plain.indexOf("{"));
  });

  it("complex text layout stacks JSON under message", () => {
    const plain = spansToPlain(
      formatStandardSpans(
        "info",
        "ndjson-peer",
        "ws.frame",
        "complex",
        "📨",
        { seq: 12, bytes: 251, path: "/ws/" },
      ),
    );
    const lines = plain.split("\n");
    expect(lines).toHaveLength(2);
    expect(lines[0]).toContain("ws.frame");
    expect(lines[1]).toContain('"seq"');
    const msgAt = lines[0]!.indexOf("ws.frame");
    const jsonAt = lines[1]!.indexOf("{");
    expect(displayWidth(lines[1]!.slice(0, jsonAt))).toBe(
      displayWidth(lines[0]!.slice(0, msgAt)),
    );
  });

  it("omits meta when there is no payload", () => {
    const plain = spansToPlain(
      formatStandardSpans("info", "api", "hello", "default"),
    );
    expect(plain.includes("\n")).toBe(false);
    expect(plain).not.toContain("{");
  });
});
