import { describe, expect, it, vi } from "vitest";
import { Writable } from "node:stream";
import buildPrettyStream from "../src/node/transport/pretty.js";

describe("consolePrettyDelivery", () => {
  it("can suppress stdout while still formatting", () => {
    const writes: string[] = [];
    const dest = new Writable({
      write(chunk, _enc, cb) {
        writes.push(chunk.toString());
        cb();
      },
    });
    const delivery = vi.fn(() => false);
    const stream = buildPrettyStream({
      options: { consolePrettyDelivery: delivery },
      destination: dest,
    });
    stream.write(
      `${JSON.stringify({ level: 30, msg: "hidden", module: "api" })}\n`,
    );
    expect(delivery).toHaveBeenCalled();
    expect(writes).toHaveLength(0);
  });

  it("pretty-prints every NDJSON line when worker batches multiple records", () => {
    const writes: string[] = [];
    const dest = new Writable({
      write(chunk, _enc, cb) {
        writes.push(chunk.toString());
        cb();
      },
    });
    const stream = buildPrettyStream({
      options: {},
      destination: dest,
    });
    const a = JSON.stringify({ level: 30, msg: "one", module: "api" });
    const b = JSON.stringify({ level: 30, msg: "two", module: "api" });
    stream.write(`${a}\n${b}\n`);
    expect(writes.join("")).toContain("one");
    expect(writes.join("")).toContain("two");
    expect(writes.join("")).not.toContain('"msg":"two"');
  });
});
