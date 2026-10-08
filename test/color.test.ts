import { describe, expect, it } from "vitest";
import {
  colorFromDid,
  didColorize,
  generateColorFromString,
} from "../src/color/did.js";
import { colorFromId } from "../src/color/id.js";
import { createTintResolver, resolveTheme } from "../src/color/theme.js";

describe("color", () => {
  it("colorFromId is stable", () => {
    const ramp = resolveTheme("solarized-dark").tintRamp;
    expect(colorFromId("watcher", ramp)).toBe(colorFromId("watcher", ramp));
  });

  it("colorize overrides", () => {
    const theme = resolveTheme("solarized-dark");
    const tint = createTintResolver(theme, (id, hex) =>
      id === "special" ? "#ff00ff" : hex,
    );
    expect(tint.resolve("special")).toBe("#ff00ff");
  });

  it("default tint uses DID identity palette for did: keys", () => {
    const theme = resolveTheme("solarized-light");
    const tint = createTintResolver(theme);
    const hostDid =
      "did:host:z7r8oppFnzGRygj2ZYeqJKs3NpEqgtva8tvAX1j8sFsPWygjqvapBhvor1uJE1kpaWmhBCCsJpqC6SnomTZ7tM3tAy5Yk";
    expect(colorFromDid(hostDid)).toBe("#956cb3");
    expect(tint.resolve(hostDid)).toBe("#956cb3");
    expect(didColorize("module-name", "#268bd2")).toBe("#268bd2");
    expect(generateColorFromString("7r8oppFnzGRygj2ZYeqJ")).toMatch(/^#[0-9a-f]{6}$/);
  });
});
