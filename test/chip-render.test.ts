import { describe, expect, it } from "vitest";
import { chromeColors, SURFACE_WHITE_HEX } from "../src/color/chrome.js";
import { createTintResolver, resolveTheme } from "../src/color/theme.js";
import { didColorize } from "../src/color/did.js";
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
      { symbolMap: { host: "/" }, ansiMode: "truecolor" },
    );
    expect(line).toContain("/");
    expect(line).toContain("energetic-domehut-y5Yk");
    expect(line).toMatch(/\u001B\[/);
  });

  it("fill chrome: white glyph box + tinted body (light)", () => {
    const theme = resolveTheme("solarized-light");
    const hostDid =
      "did:host:z7r8oppFnzGRygj2ZYeqJKs3NpEqgtva8tvAX1j8sFsPWygjqvapBhvor1uJE1kpaWmhBCCsJpqC6SnomTZ7tM3tAy5Yk";
    const tint = createTintResolver(theme, didColorize);
    const hex = tint.resolve(hostDid)!;
    const fill = chromeColors(hex, "fill", theme);
    const span = chipSpan(
      {
        kind: "host",
        body: "energetic-domehut-y5Yk",
        tintKey: hostDid,
        chrome: "fill",
      },
      { host: "/" },
    );
    const line = renderAnsi([span], theme, tint, "info", true, {
      symbolMap: { host: "/" },
      ansiMode: "truecolor",
    });
    // White `/` box
    expect(line).toContain(`48;2;255;255;255`);
    // Tinted body (not flat white for the alias)
    const { r, g, b } = {
      r: Number.parseInt(fill.background.slice(1, 3), 16),
      g: Number.parseInt(fill.background.slice(3, 5), 16),
      b: Number.parseInt(fill.background.slice(5, 7), 16),
    };
    expect(fill.background.toLowerCase()).not.toBe(SURFACE_WHITE_HEX);
    expect(line).toContain(`48;2;${r};${g};${b}`);
    expect(line).toContain("/");
    expect(line).toContain("energetic-domehut-y5Yk");
  });
});
