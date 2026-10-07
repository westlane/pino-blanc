import { describe, expect, it } from "vitest";
import {
  eventRow2TailSpans,
  eventRowContentSpans,
  formatEmojiColumn,
  formatEventNameColumn,
  padEventNameColumn,
  resolveEmojiFromMeta,
} from "../src/layout/event-columns.js";
import { displayWidth } from "../src/layout/width.js";
import { spansToPlain } from "../src/layout/line.js";

describe("event-columns", () => {
  it("formatEmojiColumn fixed width", () => {
    expect(displayWidth(formatEmojiColumn(undefined))).toBe(4);
    expect(displayWidth(formatEmojiColumn("🚀"))).toBe(4);
    expect(displayWidth(formatEmojiColumn("⭐"))).toBe(4);
  });

  it("resolveEmojiFromMeta", () => {
    expect(resolveEmojiFromMeta({ _emoji: "🔒" })).toBe("🔒");
    expect(resolveEmojiFromMeta({})).toBeUndefined();
  });

  it("eventRowContentSpans", () => {
    const spans = eventRowContentSpans("rally.auth.passed", "✅");
    const plain = spansToPlain(spans);
    expect(plain).toContain("✅");
    expect(plain).toContain("rally.auth.passed");
  });

  it("optional emoji column off", () => {
    const spans = eventRowContentSpans("ping", undefined, { showEmoji: false });
    expect(spans.some((s) => s.role === "emoji")).toBe(false);
  });

  it("eventRow2TailSpans blank emoji slot", () => {
    const plain = spansToPlain(eventRow2TailSpans());
    expect(displayWidth(plain)).toBe(6);
  });

  it("formatEventNameColumn truncates long names", () => {
    const long = "a".repeat(40);
    expect(displayWidth(formatEventNameColumn(long))).toBeLessThanOrEqual(28);
  });

  it("padEventNameColumn pads short names", () => {
    expect(displayWidth(padEventNameColumn("short"))).toBe(28);
  });
});
