import { describe, expect, it } from "vitest";
import { formatBlancEventSpans } from "../src/format/blanc-event.js";
import { spansToPlain } from "../src/layout/line.js";
import { displayWidth } from "../src/layout/width.js";
import { BLANC_EVENT_KEY } from "../src/record.js";

describe("event layout (two-line)", () => {
  it("identity-event preset aligns JSON under event name", () => {
    const record = {
      level: 30,
      msg: "host.catalog.scheduled",
      module: "boot",
      [BLANC_EVENT_KEY]: true,
      _identityKind: "host",
      _identityBody: "energetic-domehut-y5Yk",
      _identityTintKey: "host-y5Yk",
      backfillDelayMs: 600_000,
      entries: 15,
    };
    const plain = spansToPlain(
      formatBlancEventSpans(record, {
        module: "boot",
        eventLayout: "identity-meta",
        symbolMap: { host: "/" },
      }),
    );
    const lines = plain.split("\n");
    expect(lines).toHaveLength(2);
    expect(lines[0]).toContain("host.catalog.scheduled");
    expect(lines[0]).toContain("/energetic-domehut-y5Yk");
    expect(lines[1]).toContain("backfillDelayMs");
    const eventStart = displayWidth(lines[0].slice(0, lines[0].indexOf("host.catalog")));
    const jsonStart = displayWidth(lines[1].slice(0, lines[1].indexOf("{")));
    expect(jsonStart).toBe(eventStart);
  });
});
