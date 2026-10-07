import { describe, expect, it } from "vitest";
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
});
