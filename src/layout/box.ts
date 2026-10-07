import { spec } from "./layout.data.js";

export function formatBoxLine(text: string, width = spec.box.width): string {
  const minW = spec.box.minInner;
  const w = Math.max(minW, width);
  if (!text) {
    return " ".repeat(w);
  }
  const maxText = w - spec.box.pad;
  let display = text;
  if (display.length > maxText) {
    display = `${display.slice(0, maxText - spec.box.ellipsis)}...`;
  }
  const gutter = spec.box.pad / 2;
  const padding = Math.max(0, Math.floor((w - display.length - gutter) / 2));
  const left = " ".repeat(padding);
  const right = " ".repeat(
    Math.max(0, w - display.length - padding - gutter),
  );
  return `${left} ${display} ${right}`;
}
