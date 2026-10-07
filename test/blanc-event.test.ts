import { describe, expect, it } from "vitest";
import { formatBlancEventSpans } from "../src/format/blanc-event.js";
import { jsonMetaSpans } from "../src/format/json-meta.js";
import { formatStandardSpans, spansToPlain } from "../src/layout/line.js";
import { displayWidth } from "../src/layout/width.js";
import { BLANC_EVENT_KEY } from "../src/record.js";
import { renderAnsi } from "../src/render/ansi.js";
import { createTintResolver, resolveTheme } from "../src/color/theme.js";

function moduleBracketColumn(plain: string, module = "demo"): number {
  const idx = plain.indexOf(`[${module}]`);
  return displayWidth(plain.slice(0, idx));
}

describe("blanc event rows", () => {
  it("aligns [module] with standard log lines", () => {
    const standard = spansToPlain(
      formatStandardSpans("info", "demo", "ready"),
    );
    const event = spansToPlain(
      formatBlancEventSpans(
        { level: 30, msg: "api.ready", module: "demo", [BLANC_EVENT_KEY]: true },
        { module: "demo" },
      ),
    );
    expect(moduleBracketColumn(event)).toBe(moduleBracketColumn(standard));
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
