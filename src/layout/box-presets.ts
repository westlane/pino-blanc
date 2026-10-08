import { COMPLEX_LAYOUT, DEFAULT_LAYOUT } from "./layout-ids.js";
import { layoutData } from "./layout.data.js";
import type { BoxLayoutPreset } from "../types/layout.js";

/** Legacy ids → current preset names. */
const BOX_ALIASES: Record<string, string> = {
  title: DEFAULT_LAYOUT,
  simple: DEFAULT_LAYOUT,
  session: COMPLEX_LAYOUT,
};

export function resolveBoxLayoutId(boxLayout?: string): string {
  if (!boxLayout || boxLayout === DEFAULT_LAYOUT) {
    return DEFAULT_LAYOUT;
  }
  return BOX_ALIASES[boxLayout] ?? boxLayout;
}

/** Resolve a box preset by id (`default`, `complex`, or any name in layout.yml). */
export function resolveBoxLayout(boxLayout?: string): BoxLayoutPreset {
  const id = resolveBoxLayoutId(boxLayout);
  const preset = layoutData.box[id];
  if (!preset) {
    const known = Object.keys(layoutData.box).join(", ");
    throw new Error(`Unknown box layout preset "${boxLayout}". Known: ${known}`);
  }
  return preset;
}
