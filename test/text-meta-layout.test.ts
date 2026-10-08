import { describe, expect, it } from "vitest";
import { formatStandardSpans, spansToPlain } from "../src/layout/line.js";
import { displayWidth } from "../src/layout/width.js";

describe("text layout meta row", () => {
  it("default text layout aligns JSON under message", () => {
    const plain = spansToPlain(
      formatStandardSpans(
        "info",
        "ndjson-peer",
        "ws.frame",
        "default",
        "📨",
        { seq: 12, bytes: 251, path: "/ws/" },
      ),
    );
    const lines = plain.split("\n");
    expect(lines).toHaveLength(2);
    expect(lines[0]).toContain("ws.frame");
    expect(lines[1]).toContain('"seq"');
    const msgAt = lines[0].indexOf("ws.frame");
    const jsonAt = lines[1].indexOf("{");
    expect(displayWidth(lines[1].slice(0, jsonAt))).toBe(
      displayWidth(lines[0].slice(0, msgAt)),
    );
  });

  it("omits meta row when there is no payload", () => {
    const plain = spansToPlain(
      formatStandardSpans("info", "api", "hello", "default"),
    );
    expect(plain.includes("\n")).toBe(false);
  });
});
