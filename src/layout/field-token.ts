import type { LogLayoutField } from "../types.js";

export type FieldAlign = "left" | "right" | "auto";

export type FieldModifiers = {
  align: FieldAlign;
  width?: number;
};

const ALIGN = new Set(["left", "right", "auto"]);

export function resolveLayoutField(token: string): LogLayoutField {
  if (token === "event") {
    return "message";
  }
  if (token === "level" || token === "module" || token === "message" || token === "emoji") {
    return token;
  }
  throw new Error(`Unknown log layout field %${token}%`);
}

/** Parse `%field%`, `%field:18%`, `%field:right%`, `%field:18:right%`. */
export function parseFieldModifiers(
  field: string,
  clause: string | undefined,
): FieldModifiers {
  const defaultAlign: FieldAlign = field === "module" ? "auto" : "left";
  if (!clause) {
    return { align: defaultAlign };
  }

  let align: FieldAlign = defaultAlign;
  let width: number | undefined;

  for (const seg of clause.split(":")) {
    if (ALIGN.has(seg)) {
      align = seg as FieldAlign;
      continue;
    }
    if (/^\d+$/.test(seg)) {
      width = Number(seg);
      continue;
    }
    throw new Error(`Unknown modifier "${seg}" in %${field}:${clause}%`);
  }

  return { align, width };
}

export const LAYOUT_FIELD_RE = /%([a-z]+)(?::([^%]+))?%/g;
