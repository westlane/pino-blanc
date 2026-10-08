import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { COMPLEX_LAYOUT } from "../src/layout/layout-ids.js";
import { formatStandardSpans, spansToPlain } from "../src/layout/line.js";

const root = dirname(fileURLToPath(import.meta.url));

describe("vectors", () => {
  it("line.json default vs complex", () => {
    const raw = readFileSync(
      join(root, "../spec/vectors/line.json"),
      "utf8",
    );
    const vectors = JSON.parse(raw) as {
      defaultPlain: string;
      complexPlain: string;
    };
    expect(
      spansToPlain(formatStandardSpans("info", "api", "hello world")),
    ).toBe(vectors.defaultPlain);
    expect(
      spansToPlain(
        formatStandardSpans("info", "api", "hello world", COMPLEX_LAYOUT),
      ),
    ).toBe(vectors.complexPlain);
  });
});
