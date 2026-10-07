import { describe, expect, it } from "vitest";
import { colorFromId } from "../src/color/id.js";
import { resolveTheme, createTintResolver } from "../src/color/theme.js";
import { solarizedDark } from "../src/color/themes/solarized-dark.js";

describe("color", () => {
  it("colorFromId is stable", () => {
    const ramp = solarizedDark.tintRamp;
    expect(colorFromId("watcher", ramp)).toBe(colorFromId("watcher", ramp));
  });

  it("colorTransform overrides", () => {
    const theme = resolveTheme("solarized-dark");
    const tint = createTintResolver(theme, (id, hex) =>
      id === "special" ? "#ff00ff" : hex,
    );
    expect(tint.resolve("special")).toBe("#ff00ff");
  });
});
