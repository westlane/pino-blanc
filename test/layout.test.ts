import { describe, expect, it } from "vitest";
import { formatBoxLine } from "../src/layout/box.js";
import { formatStandardSpans, spansToPlain } from "../src/layout/line.js";
import { stripAnsi } from "../src/layout/width.js";
describe("layout", () => {
  it("formats standard line plain", () => {
    const spans = formatStandardSpans("info", "api", "hello world");
    const plain = spansToPlain(spans);
    expect(plain).toContain("INFO");
    expect(plain).toContain("[api");
    expect(plain).toContain("hello world");
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
