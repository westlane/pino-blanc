import { describe, expect, it } from "vitest";
import { formatBlancEventSpans } from "../src/format/blanc-event.js";
import { jsonMetaSpans } from "../src/format/json-meta.js";
import { spansToPlain } from "../src/layout/line.js";
import { BLANC_EVENT_KEY } from "../src/record.js";
import { renderAnsi } from "../src/render/ansi.js";
import { createTintResolver, resolveTheme } from "../src/color/theme.js";

describe("blanc event rows", () => {
  it("uses event.default (emoji + event name; inline meta on row 1)", () => {
    const event = spansToPlain(
      formatBlancEventSpans(
        {
          level: 30,
          msg: "ws.batch_done",
          module: "demo",
          [BLANC_EVENT_KEY]: true,
          frames: 2,
        },
        { module: "demo" },
      ),
    );
    expect(event).toContain("ws.batch_done");
    expect(event).toContain("frames");
    expect(event.includes("\n")).toBe(false);
    expect(event.indexOf("ws.batch_done")).toBeLessThan(event.indexOf("{"));
  });

  it("uses event.complex (stacked meta on row 2)", () => {
    const event = spansToPlain(
      formatBlancEventSpans(
        {
          level: 30,
          msg: "ws.batch_done",
          module: "demo",
          [BLANC_EVENT_KEY]: true,
          frames: 2,
        },
        { module: "demo", eventLayout: "complex" },
      ),
    );
    const lines = event.split("\n");
    expect(lines).toHaveLength(2);
    expect(lines[0]).toContain("ws.batch_done");
    expect(lines[1]).toContain("frames");
  });

  it("jsonMetaSpans uses multiple highlight roles", () => {
    const theme = resolveTheme("solarized-dark");
    const tint = createTintResolver(theme);
    const spans = jsonMetaSpans({ userId: "u_01", ttl: 0 });
    const line = renderAnsi(spans, theme, tint, "info", true, {});
    const roles = new Set(spans.map((s) => s.role));
    expect(roles.has("accent")).toBe(true);
    expect(roles.has("meta")).toBe(true);
    const escapes = line.match(/\u001B\[/g) ?? [];
    expect(escapes.length).toBeGreaterThan(3);
  });
});
