import { describe, expect, it } from "vitest";
import { applySymbol, splitPrefix } from "../src/layout/symbol.js";

const MAP = {
  host: "/",
  user: "@",
  agent: "%",
};

describe("symbol map", () => {
  it("applySymbol prefixes body", () => {
    expect(applySymbol("host", "energetic-domehut-y5Yk", MAP)).toBe(
      "/energetic-domehut-y5Yk",
    );
  });

  it("splitPrefix uses map glyph values", () => {
    expect(splitPrefix("/energetic-domehut-y5Yk", MAP)).toEqual({
      glyph: "/",
      body: "energetic-domehut-y5Yk",
    });
    expect(splitPrefix("plain-host", MAP)).toBeNull();
  });
});
