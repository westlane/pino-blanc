import { describe, expect, it } from "vitest";
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { COMPLEX_LAYOUT } from "../src/layout/layout-ids.js";
import { formatStandardSpans, spansToPlain } from "../src/layout/line.js";

const root = dirname(fileURLToPath(import.meta.url));
const vectorPath = join(root, "../spec/vectors/line.json");

describe("vectors", () => {
  it("line.json default vs complex", () => {
    const defaultPlain = spansToPlain(
      formatStandardSpans("info", "api", "hello world"),
    );
    const complexPlain = spansToPlain(
      formatStandardSpans("info", "api", "hello world", COMPLEX_LAYOUT),
    );
    if (process.env.UPDATE_VECTORS === "1") {
      writeFileSync(
        vectorPath,
        `${JSON.stringify({ defaultPlain, complexPlain }, null, 2)}\n`,
      );
    }
    const vectors = JSON.parse(readFileSync(vectorPath, "utf8")) as {
      defaultPlain: string;
      complexPlain: string;
    };
    expect(defaultPlain).toBe(vectors.defaultPlain);
    expect(complexPlain).toBe(vectors.complexPlain);
  });
});
