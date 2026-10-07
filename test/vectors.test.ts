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
    const vectors = JSON.parse(raw) as {
      defaultPlain: string;
      classicPlain: string;
    };
    expect(
      spansToPlain(formatStandardSpans("info", "api", "hello world")),
    ).toBe(vectors.defaultPlain);
    expect(
      spansToPlain(formatStandardSpans("info", "api", "hello world", "classic")),
    ).toBe(vectors.classicPlain);
  });
});
