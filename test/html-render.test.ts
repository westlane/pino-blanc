import { describe, expect, it } from "vitest";
import { resolveTheme } from "../src/color/theme.js";
import { createTintResolver } from "../src/color/theme.js";
import { formatStandardSpans } from "../src/layout/line.js";
import { renderCss } from "../src/render/css.js";
import {
  collectStyledParts,
  escapeHtml,
  formatRecordHtml,
  renderHtml,
  renderHtmlParts,
} from "../src/render/html.js";

const theme = resolveTheme("solarized-dark");
const tint = createTintResolver(theme);

describe("html render", () => {
  it("escapeHtml escapes markup", () => {
    expect(escapeHtml(`<script>"x"&</script>`)).toBe(
      "&lt;script&gt;&quot;x&quot;&amp;&lt;/script&gt;",
    );
  });

  it("renderHtmlParts preserves padded spaces", () => {
    const html = renderHtmlParts([
      { text: "  pad", css: "color: rgb(1, 2, 3)" },
      { text: "   ", css: "background: rgb(4, 5, 6)" },
      { text: "tail", css: "" },
    ]);
    expect(html).toContain("  pad");
    expect(html).toContain("   ");
    expect(html).toContain("tail");
  });

  it("renderHtml uses the same styled parts as renderCss", () => {
    const spans = formatStandardSpans("info", "app", "hello <world>", undefined, {});
    const level = "info";
    const parts = collectStyledParts(spans, theme, tint, level, {});
    const { text, styles } = renderCss(spans, theme, tint, level, {});
    const html = renderHtml(spans, theme, tint, level, {});

    expect(parts.length).toBe(styles.length);
    for (let i = 0; i < parts.length; i++) {
      expect(parts[i]?.css).toBe(styles[i]);
      expect(text).toContain(`%c${parts[i]?.text}`);
    }
    for (const part of parts) {
      if (part.css) {
        expect(html).toContain(`<span style="${part.css}">`);
        expect(html).toContain(escapeHtml(part.text));
      }
    }
    expect(html).toContain(escapeHtml("<world>"));
  });

  it("formatRecordHtml returns null when formatRecord skips the line", () => {
    const html = formatRecordHtml(
      { level: 30, msg: "skip", module: "app" },
      {
        theme: "solarized-dark",
        formatRecord: () => "",
      },
    );
    expect(html).toBeNull();
  });

  it("formatRecordHtml renders a standard info line", () => {
    const html = formatRecordHtml(
      { level: 30, msg: "ready", module: "server" },
      { theme: "solarized-dark" },
    );
    expect(html).toBeTruthy();
    expect(html).toContain("ready");
    expect(html).toContain("server");
  });
});
