import { describe, expect, it } from "vitest";
import { formatBoxLine } from "../src/layout/box.js";
import { formatStandardSpans, spansToPlain } from "../src/layout/line.js";
import { displayWidth, stripAnsi } from "../src/layout/width.js";
describe("layout", () => {
  it("formats standard line plain with fixed module column brackets", () => {
    const gateway = spansToPlain(
      formatStandardSpans("info", "gateway", "ws.frame"),
    );
    const peer = spansToPlain(
      formatStandardSpans("info", "ndjson-peer", "ws.frame"),
    );
    expect(gateway).toContain("INFO");
    expect(gateway).toMatch(/\[.*gateway.*\]/);
    expect(gateway).toContain("ws.frame");
    // `[` and `]` sit on the same columns for every module name.
    expect(gateway.indexOf("[")).toBe(peer.indexOf("["));
    expect(gateway.lastIndexOf("]")).toBe(peer.lastIndexOf("]"));
    expect(displayWidth(gateway)).toBe(displayWidth(peer));
  });

  it("box vector width", () => {
    const line = formatBoxLine("centered text");
    expect(line.length).toBeGreaterThan(10);
    expect(line).toContain("centered");
  });

  it("stripAnsi", () => {
    expect(stripAnsi("\u001B[32mok\u001B[0m")).toBe("ok");
  });
});
