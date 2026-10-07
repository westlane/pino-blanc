import { applySymbol } from "./symbol.js";
import type { ChipChrome, LogSpan } from "../types.js";
import type { SymbolMap } from "./symbol.js";
import { padEndDisplay } from "./pad.js";

export type ChipSpanInput = {
  text?: string;
  kind?: string;
  body?: string;
  tintKey: string;
  chrome?: ChipChrome;
};

export function chipSpan(
  input: ChipSpanInput,
  symbolMap?: SymbolMap,
): LogSpan {
  let text = input.text ?? "";
  if (!text && input.kind && input.body) {
    text = applySymbol(input.kind, input.body, symbolMap);
  }
  return {
    text,
    role: "chip",
    tintKey: input.tintKey,
    chrome: input.chrome ?? "inverted",
    kind: input.kind,
  };
}

export function leadingColumn(spans: LogSpan[], width: number): LogSpan[] {
  if (spans.length === 0) {
    return spans;
  }
  const [first, ...rest] = spans;
  const padded = {
    ...first,
    text: padEndDisplay(first.text, width),
  };
  return [padded, ...rest];
}
