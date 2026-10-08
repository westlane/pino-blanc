import type { LogLayoutField } from "../types.js";

export type FieldAlign = "left" | "right" | "center" | "auto";

export type FieldModifiers = {
  align: FieldAlign;
  width?: number;
  minWidth?: number;
};

/** Short aliases → canonical token names. Long names also accepted. */
export const FIELD_ALIASES: Record<string, string> = {
  lv: "level",
  mj: "emoji",
  ms: "message",
  md: "module",
  id: "identity",
  ev: "event",
  mt: "meta",
};

const ALIGN = new Set(["left", "right", "center", "auto"]);

export function canonicalizeFieldToken(token: string): string {
  return FIELD_ALIASES[token] ?? token;
}

/** Text-line fields (`%lv%` / `%level%`, …). `%ev%` / `%event%` → message column. */
export function resolveLayoutField(token: string): LogLayoutField {
  const canonical = canonicalizeFieldToken(token);
  if (canonical === "event") {
    return "message";
  }
  if (
    canonical === "level" ||
    canonical === "module" ||
    canonical === "message" ||
    canonical === "emoji" ||
    canonical === "identity"
  ) {
    return canonical;
  }
  throw new Error(`Unknown log layout field %${token}%`);
}

/** Parse `%field%`, `%field:18%`, `%field:12-34%`, `%field:18:center%`. */
export function parseFieldModifiers(
  field: string,
  clause: string | undefined,
): FieldModifiers {
  const canonical = canonicalizeFieldToken(field);
  const defaultAlign: FieldAlign = canonical === "module" ? "auto" : "left";
  if (!clause) {
    return { align: defaultAlign };
  }

  let align: FieldAlign = defaultAlign;
  let width: number | undefined;
  let minWidth: number | undefined;

  for (const seg of clause.split(":")) {
    if (ALIGN.has(seg)) {
      align = seg as FieldAlign;
      continue;
    }
    const range = seg.match(/^(\d+)-(\d+)$/);
    if (range) {
      minWidth = Number(range[1]);
      width = Number(range[2]);
      continue;
    }
    if (/^\d+$/.test(seg)) {
      width = Number(seg);
      continue;
    }
    throw new Error(`Unknown modifier "${seg}" in %${field}:${clause}%`);
  }

  return { align, width, minWidth };
}

export const LAYOUT_FIELD_RE = /%([a-z]+)(?::([^%]+))?%/g;

/** True if the template contains `%meta%` or `%mt%` (with optional modifiers). */
export function templateHasMeta(template: string): boolean {
  return /%(?:meta|mt)(?::[^%]*)?%/.test(template);
}

/** True if the template contains `%identity%` or `%id%`. */
export function templateHasIdentity(template: string): boolean {
  return /%(?:identity|id)(?::[^%]*)?%/.test(template);
}
