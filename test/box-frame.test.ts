import { describe, expect, it } from "vitest";
import { parseBoxFrame } from "../src/layout/box-frame.js";
import {
  formatBoxBandLines,
  isBoxPaddingBand,
} from "../src/layout/box-bands.js";
import { resolveBoxLayout } from "../src/layout/box-presets.js";

describe("box frame", () => {
  it("parses a single title band", () => {
    const metrics = parseBoxFrame(`
[------------------- %title% --------------------]
`);
    expect(metrics.bands).toHaveLength(1);
    expect(metrics.width).toBe(48);
  });

  it("parses padding bands around content", () => {
    const metrics = parseBoxFrame(`
[------------------------------------------------]
[-------- %title% %version% - %lv% level --------]
[------------------------------------------------]
[------------------ %subtitle% ------------------]
[------------------------------------------------]
`);
    expect(metrics.bands).toHaveLength(5);
    expect(isBoxPaddingBand(metrics.bands[0]!)).toBe(true);
    expect(isBoxPaddingBand(metrics.bands[1]!)).toBe(false);
    expect(isBoxPaddingBand(metrics.bands[2]!)).toBe(true);
    expect(metrics.width).toBe(48);
  });
});

describe("box presets", () => {
  it("defaults to box.default; complex fills version and subtitle", () => {
    expect(resolveBoxLayout().bands).toHaveLength(3);
    expect(resolveBoxLayout("default").bands).toHaveLength(3);
    expect(resolveBoxLayout("complex").bands).toHaveLength(6);

    const simple = formatBoxBandLines({ title: "rally" }, "default");
    expect(simple.titleLine).toBe("rally");
    expect(simple.hasSubtitleBand).toBe(false);

    const complex = formatBoxBandLines(
      {
        title: "rally",
        version: "0.52.6",
        level: "info",
        subtitle: "/energetic-domehut-y5Yk",
      },
      "complex",
    );
    expect(complex.titleLine).toBe("rally v0.52.6 - info level");
    expect(complex.subtitleLine).toBe("/energetic-domehut-y5Yk");
    expect(complex.hasSubtitleBand).toBe(true);
  });
});
