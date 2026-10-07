import { describe, expect, it } from "vitest";
import { createTintResolver, resolveTheme } from "../src/color/theme.js";
import { chipSpan } from "../src/layout/chip.js";
import { renderAnsi } from "../src/render/ansi.js";

describe("chip render", () => {
  it("renders prefix chrome with symbol map", () => {
    const theme = resolveTheme("solarized-dark");
    const tint = createTintResolver(theme);
    const span = chipSpan(
      {
        kind: "host",
        body: "energetic-domehut-y5Yk",
        tintKey: "host-key",
        chrome: "prefix",
      },
      { host: "/" },
    );
    const line = renderAnsi(
      [span],
      theme,
      tint,
      "info",
      true,
      { symbolMap: { host: "/" } },
    );
    expect(line).toContain("/");
    expect(line).toContain("energetic-domehut-y5Yk");
    expect(line).toMatch(/\u001B\[/);
  });
});
