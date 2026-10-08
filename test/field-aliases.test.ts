import { describe, expect, it } from "vitest";
import {
  canonicalizeFieldToken,
  resolveLayoutField,
} from "../src/layout/field-token.js";
import { formatLayoutSpans } from "../src/layout/template.js";
import { spansToPlain } from "../src/layout/line.js";

describe("field token aliases", () => {
  it("maps short names to canonical", () => {
    expect(canonicalizeFieldToken("lv")).toBe("level");
    expect(canonicalizeFieldToken("mj")).toBe("emoji");
    expect(canonicalizeFieldToken("ms")).toBe("message");
    expect(canonicalizeFieldToken("md")).toBe("module");
    expect(canonicalizeFieldToken("id")).toBe("identity");
    expect(canonicalizeFieldToken("ev")).toBe("event");
    expect(canonicalizeFieldToken("mt")).toBe("meta");
  });

  it("short tokens format like long names", () => {
    const ctx = { level: "info" as const, module: "api", message: "hi" };
    const long = spansToPlain(formatLayoutSpans("%level% %message%", ctx));
    const short = spansToPlain(formatLayoutSpans("%lv% %ms%", ctx));
    expect(short).toBe(long);
    expect(resolveLayoutField("ev")).toBe("message");
  });
});
