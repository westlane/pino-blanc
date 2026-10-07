import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { formatStandardSpans, spansToPlain } from "../src/layout/line.js";

const root = dirname(fileURLToPath(import.meta.url));

describe("vectors", () => {
  it("line.json standardPlain", () => {
    const raw = readFileSync(
      join(root, "../spec/vectors/line.json"),
      "utf8",
    );
    const expected = JSON.parse(raw).standardPlain as string;
    const actual = spansToPlain(formatStandardSpans("info", "api", "hello world"));
    expect(actual).toBe(expected);
  });
});
