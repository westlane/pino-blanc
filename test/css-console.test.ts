import { describe, expect, it } from "vitest";
import { formatStandardSpans } from "../src/layout/line.js";
import { renderCss } from "../src/render/css.js";
import { createTintResolver, resolveTheme } from "../src/color/theme.js";

describe("renderCss (browser console)", () => {
  it("emits one style per %c (no trailing css leaked as text)", () => {
    const theme = resolveTheme("solarized-dark");
    const tint = createTintResolver(theme);
    const spans = formatStandardSpans(
      "info",
      "Checkout",
      "react click",
      undefined,
      undefined,
      { via: "PBProvider" },
    );
    const { text, styles } = renderCss(spans, theme, tint, "info", {});
    const placeholders = text.match(/%c/g)?.length ?? 0;
    expect(placeholders).toBe(styles.length);
    expect(placeholders).toBeGreaterThan(0);
    expect(text).not.toContain("color: rgb(");
  });
});
