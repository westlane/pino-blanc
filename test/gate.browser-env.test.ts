import { describe, expect, it } from "vitest";
import { readEnv, resolveThemeIdFromEnv } from "../src/color/gate.js";

describe("gate browser env", () => {
  it("readEnv returns empty object when process is missing", () => {
    const g = globalThis as { process?: unknown };
    const prev = g.process;
    try {
      delete g.process;
      expect(readEnv()).toEqual({});
      expect(resolveThemeIdFromEnv()).toBeUndefined();
    } finally {
      if (prev !== undefined) {
        g.process = prev;
      }
    }
  });
});
