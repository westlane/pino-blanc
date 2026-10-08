import { describe, expect, it } from "vitest";
import { Writable } from "node:stream";
import {
  countTerminalLines,
  isLiveReplaceRecord,
  liveReplacePrefix,
  LiveReplaceTracker,
} from "../src/format/live-replace.js";
import { PB_LIVE_REPLACE_KEY } from "../src/record.js";
import buildPrettyStream from "../src/node/transport/pretty.js";

describe("live-replace", () => {
  it("countTerminalLines treats trailing newline as a completed row", () => {
    expect(countTerminalLines("a\n")).toBe(1);
    expect(countTerminalLines("a\nb\n")).toBe(2);
    expect(countTerminalLines("\na\n")).toBe(2);
    expect(countTerminalLines("no-nl")).toBe(1);
  });

  it("liveReplacePrefix emits CSI up + erase", () => {
    expect(liveReplacePrefix(0)).toBe("");
    expect(liveReplacePrefix(2)).toBe("\x1b[2A\x1b[0J");
  });

  it("isLiveReplaceRecord", () => {
    expect(isLiveReplaceRecord({ [PB_LIVE_REPLACE_KEY]: true })).toBe(true);
    expect(isLiveReplaceRecord({ [PB_LIVE_REPLACE_KEY]: false })).toBe(false);
    expect(isLiveReplaceRecord({})).toBe(false);
  });

  it("LiveReplaceTracker prefixes only after the first live write", () => {
    const tracker = new LiveReplaceTracker();
    const first = tracker.prepare("one\n", true);
    expect(first).toBe("one\n");
    const second = tracker.prepare("two\n", true);
    expect(second).toBe("\x1b[1A\x1b[0Jtwo\n");
    const done = tracker.prepare("done\n", false);
    expect(done).toBe("done\n");
    const again = tracker.prepare("three\n", true);
    expect(again).toBe("three\n");
  });

  it("pretty stream rewrites successive _liveReplace ticks", () => {
    const writes: string[] = [];
    const dest = new Writable({
      write(chunk, _enc, cb) {
        writes.push(chunk.toString());
        cb();
      },
    });
    const stream = buildPrettyStream({
      options: { forceColor: false, plainStdout: true },
      destination: dest,
    });
    const tick = (seq: number) =>
      JSON.stringify({
        level: 30,
        msg: "ws.frame",
        module: "gateway",
        pbEvent: true,
        _liveReplace: true,
        seq,
      });
    stream.write(`${tick(1)}\n`);
    stream.write(`${tick(2)}\n`);
    stream.write(
      `${JSON.stringify({
        level: 30,
        msg: "ws.batch_done",
        module: "gateway",
        pbEvent: true,
        frames: 2,
      })}\n`,
    );

    const joined = writes.join("");
    expect(joined).toContain("\x1b[");
    expect(joined).toContain("ws.frame");
    expect(joined).toContain("ws.batch_done");
    // First tick has no CSI; second tick must move up.
    expect(writes[0]).not.toContain("\x1b[");
    expect(writes[1]).toMatch(/^\x1b\[\d+A\x1b\[0J/);
    expect(writes[2]).not.toContain("\x1b[");
  });
});
