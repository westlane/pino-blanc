import type { LogSpan } from "../types.js";

function readJsonString(raw: string, start: number): { text: string; end: number } {
  let i = start + 1;
  while (i < raw.length) {
    const ch = raw[i];
    if (ch === "\\") {
      i += 2;
      continue;
    }
    if (ch === '"') {
      return { text: raw.slice(start, i + 1), end: i + 1 };
    }
    i += 1;
  }
  return { text: raw.slice(start), end: raw.length };
}

function readNumber(raw: string, start: number): { text: string; end: number } {
  const match = /^-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?/.exec(raw.slice(start));
  if (!match) {
    return { text: raw[start] ?? "", end: start + 1 };
  }
  return { text: match[0], end: start + match[0].length };
}

function readWord(raw: string, start: number): { text: string; end: number } {
  const match = /^(true|false|null)/.exec(raw.slice(start));
  if (!match) {
    return { text: raw[start] ?? "", end: start + 1 };
  }
  return { text: match[0], end: start + match[0].length };
}

/** Syntax-colored JSON object meta spans for event payload rows. */
export function jsonMetaSpans(value: Record<string, unknown>): LogSpan[] {
  const raw = JSON.stringify(value);
  const spans: LogSpan[] = [];
  let i = 0;
  while (i < raw.length) {
    const ch = raw[i];
    if (ch === '"') {
      const { text, end } = readJsonString(raw, i);
      const isKey = raw[end] === ":";
      spans.push({
        text,
        role: isKey ? "accent" : "message",
      });
      i = end;
      continue;
    }
    if (ch === "{" || ch === "}" || ch === "[" || ch === "]" || ch === "," || ch === ":") {
      spans.push({ text: ch, role: "meta" });
      i += 1;
      continue;
    }
    if (ch === " " || ch === "\n") {
      spans.push({ text: ch, role: "message" });
      i += 1;
      continue;
    }
    if (ch === "-" || (ch >= "0" && ch <= "9")) {
      const { text, end } = readNumber(raw, i);
      spans.push({ text, role: "level", tintKey: "json:number" });
      i = end;
      continue;
    }
    if (ch === "t" || ch === "f" || ch === "n") {
      const { text, end } = readWord(raw, i);
      spans.push({ text, role: "meta" });
      i = end;
      continue;
    }
    spans.push({ text: ch, role: "message" });
    i += 1;
  }
  return spans;
}
