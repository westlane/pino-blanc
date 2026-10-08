export type BracketAlign = "left" | "right" | "center";

export type ParsedBracketSlot =
  | { kind: "pad"; width: number }
  | {
      kind: "field";
      token: string;
      width: number;
      minWidth?: number | undefined;
      align: BracketAlign;
    };

/** `%id%` or `%id` (closing `%` optional); optional `:clause`. */
const CELL_FIELD_RE = /%([a-z]+)(?::([^%\s\]]+))?%?/;
const BRACKET_RE = /\[([^\]]*)\]/g;

/**
 * Pad brackets — `[…]` is a column; width = characters inside the brackets.
 *
 * ```
 * [%lv%--][%mj%][%ms%------------------------------][--------------%md%]
 * [------][----][%mt%]
 * [----------- %id% -----------][%mj%][%ev%------------------------]
 * ```
 *
 * Align from padding around the token (spaces/dashes both sides → center,
 * only before → right, else left). Empty bracket → space pad.
 *
 * Spaces between `]` and `[` are real gutters in the output
 * (e.g. `][%mj%]  [%ev%` → two spaces between emoji and event).
 *
 * Legacy `| cell | cell |` rows are still expanded (same width/align rules)
 * so leftover pipe templates never print `|` literally.
 */
export function parseBracketSlot(inner: string): ParsedBracketSlot {
  const width = inner.length;
  const fieldMatch = CELL_FIELD_RE.exec(inner);
  if (!fieldMatch || fieldMatch.index === undefined) {
    return { kind: "pad", width };
  }

  const token = fieldMatch[1] ?? "";
  const before = inner.slice(0, fieldMatch.index);
  const after = inner.slice(fieldMatch.index + fieldMatch[0].length);

  let minWidth: number | undefined;
  let maxWidth: number | undefined;
  const size = before.match(/^\s*(\d+)(?:-(\d+))?\s*/);
  let prefix = before;
  if (size) {
    if (size[2] !== undefined) {
      minWidth = Number(size[1]);
      maxWidth = Number(size[2]);
    } else {
      maxWidth = Number(size[1]);
    }
    prefix = before.slice(size[0].length);
  }

  const clause = fieldMatch[2];
  if (maxWidth === undefined && clause) {
    const range = clause.match(/^(\d+)-(\d+)$/);
    const single = clause.match(/^(\d+)$/);
    if (range) {
      minWidth = Number(range[1]);
      maxWidth = Number(range[2]);
    } else if (single) {
      maxWidth = Number(single[1]);
    }
  }

  const columnWidth = maxWidth ?? width;

  const prefixPad = prefix.length > 0 && /[-\s]/.test(prefix);
  const suffixPad = after.length > 0 && /[-\s]/.test(after);
  let align: BracketAlign = "left";
  if (prefixPad && suffixPad) {
    align = "center";
  } else if (prefixPad && !suffixPad) {
    align = "right";
  }

  return {
    kind: "field",
    token,
    width: columnWidth,
    minWidth,
    align,
  };
}

function expandSlot(inner: string): string {
  const fieldMatch = CELL_FIELD_RE.exec(inner);
  // Meta is not a fixed-width cell — keep leading pad, then bare %mt%/%meta%.
  const fieldName = fieldMatch?.[1];
  if (fieldMatch && fieldName && /^(mt|meta)$/.test(fieldName)) {
    const prefix = inner.slice(0, fieldMatch.index);
    const pad = prefix.replace(/-/g, " ");
    return `${pad}%${fieldName}%`;
  }

  const slot = parseBracketSlot(inner);
  if (slot.kind === "pad") {
    return " ".repeat(slot.width);
  }
  const segs = [slot.token];
  if (slot.minWidth !== undefined) {
    segs.push(`${slot.minWidth}-${slot.width}`);
  } else {
    segs.push(String(slot.width));
  }
  if (slot.align !== "left") {
    segs.push(slot.align);
  }
  return `%${segs.join(":")}%`;
}

function cellHasMeta(inner: string): boolean {
  const match = CELL_FIELD_RE.exec(inner);
  return Boolean(match && (match[1] === "mt" || match[1] === "meta"));
}

function expandBracketRow(row: string): string {
  let out = "";
  let lastIndex = 0;
  let stop = false;
  for (const match of row.matchAll(BRACKET_RE)) {
    if (stop) {
      break;
    }
    const index = match.index ?? 0;
    out += row.slice(lastIndex, index);
    const inner = match[1] ?? "";
    out += expandSlot(inner);
    lastIndex = index + match[0].length;
    if (cellHasMeta(inner)) {
      stop = true;
    }
  }
  if (!stop) {
    out += row.slice(lastIndex);
  }
  return out;
}

/** Legacy `|…|…|` rows — same cell rules as brackets; drops the pipe delimiters. */
function expandPipeRow(row: string): string {
  const cells = row.split("|");
  const start = cells[0] === "" ? 1 : 0;
  const end = cells[cells.length - 1] === "" ? cells.length - 1 : cells.length;
  let out = "";
  for (let i = start; i < end; i++) {
    const cell = cells[i] ?? "";
    out += expandSlot(cell);
    if (cellHasMeta(cell)) {
      break;
    }
  }
  return out;
}

function expandLayoutRow(row: string): string {
  if (row.includes("[")) {
    return expandBracketRow(row);
  }
  if (row.includes("|")) {
    return expandPipeRow(row);
  }
  return row;
}

/** Rewrite `[…][…]` (or legacy `|…|`) rows into `%field:width:align%` tokens and space pads. */
export function expandPadBrackets(template: string): string {
  return template.split("\n").map(expandLayoutRow).join("\n");
}
