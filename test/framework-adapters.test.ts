import { describe, expect, it } from "vitest";
import { requirePBLogger } from "../src/adapters/require-logger.js";
import { PB_MISSING_PLUGIN } from "../src/vue/useLogger.js";
import { PB_MISSING_PROVIDER } from "../src/react/useLogger.js";
import { pbLoggerKey } from "../src/vue/key.js";

describe("framework adapters", () => {
  it("requirePBLogger throws with provider message", () => {
    expect(() => requirePBLogger(null, PB_MISSING_PROVIDER)).toThrow(
      /PBProvider/,
    );
  });

  it("requirePBLogger throws with vue plugin message", () => {
    expect(() => requirePBLogger(undefined, PB_MISSING_PLUGIN)).toThrow(
      /pbPlugin/,
    );
  });

  it("pbLoggerKey is a symbol", () => {
    expect(typeof pbLoggerKey).toBe("symbol");
  });
});
