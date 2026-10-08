import { describe, expect, it } from "vitest";
import { COMPLEX_LAYOUT } from "../src/layout/layout-ids.js";
import { formatStandardSpans, spansToPlain } from "../src/layout/line.js";

describe("layout plain output", () => {
  it("default vs complex column placement", () => {
    const defaultPlain = spansToPlain(
      formatStandardSpans("info", "api", "hello world"),
    );
    const complexPlain = spansToPlain(
      formatStandardSpans("info", "api", "hello world", COMPLEX_LAYOUT),
    );
    expect(defaultPlain).toBe("INFO    [   api    ] hello world                ");
    expect(complexPlain).toBe(
      "INFO        hello world                       [   api    ]",
    );
  });
});
