import { describe, expect, it } from "vitest";
import {
  PB_CONTROL_META_KEYS,
  PB_EVENT_KEY,
  PB_LIVE_REPLACE_KEY,
  isPBEventRecord,
  stripPinoBindings,
} from "../src/record.js";

describe("record", () => {
  it("isPBEventRecord accepts pbEvent only", () => {
    expect(isPBEventRecord({ [PB_EVENT_KEY]: true })).toBe(true);
    expect(isPBEventRecord({ other: true })).toBe(false);
    expect(isPBEventRecord({})).toBe(false);
  });

  it("stripPinoBindings removes pino and event marker keys", () => {
    expect(
      stripPinoBindings({
        level: 30,
        msg: "x",
        module: "m",
        pbEvent: true,
        did: "y5Yk",
      }),
    ).toEqual({ did: "y5Yk" });
  });

  it("stripPinoBindings drops control meta when listed", () => {
    expect(
      stripPinoBindings(
        {
          seq: 1,
          _emoji: "📨",
          [PB_LIVE_REPLACE_KEY]: true,
        },
        [...PB_CONTROL_META_KEYS],
      ),
    ).toEqual({ seq: 1 });
  });
});
