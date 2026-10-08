import { describe, expect, it } from "vitest";
import { requirePBLogger } from "../src/adapters/require-logger.js";
import { PBLoggerContext } from "../src/react/context.js";
import { PB_MISSING_PROVIDER } from "../src/react/useLogger.js";
import {
  getLogger,
  pbLoggerKey as sveltePbLoggerKey,
  useLogger as svelteUseLogger,
} from "../src/svelte/context.js";
import { pbLoggerKey as vuePbLoggerKey } from "../src/vue/key.js";
import { PB_MISSING_PLUGIN } from "../src/vue/useLogger.js";

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

  it("exports advanced context keys for each adapter", () => {
    expect(typeof vuePbLoggerKey).toBe("symbol");
    expect(typeof sveltePbLoggerKey).toBe("symbol");
    expect(PBLoggerContext).toBeTruthy();
  });

  it("svelte useLogger is an alias of getLogger", () => {
    expect(svelteUseLogger).toBe(getLogger);
  });
});
