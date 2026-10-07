import { describe, expect, it } from "vitest";
import {
  BLANC_EVENT_KEY,
  isBlancEventRecord,
  stripPinoBindings,
} from "../src/record.js";

describe("record", () => {
  it("isBlancEventRecord accepts blancEvent only", () => {
    expect(isBlancEventRecord({ [BLANC_EVENT_KEY]: true })).toBe(true);
    expect(isBlancEventRecord({ other: true })).toBe(false);
    expect(isBlancEventRecord({})).toBe(false);
  });

  it("stripPinoBindings removes pino and event marker keys", () => {
    expect(
      stripPinoBindings({
        level: 30,
        msg: "x",
        module: "m",
        blancEvent: true,
        did: "y5Yk",
      }),
    ).toEqual({ did: "y5Yk" });
  });
});
