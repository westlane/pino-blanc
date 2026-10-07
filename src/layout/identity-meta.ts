import { spec } from "./layout.data.js";
import { chipSpan } from "./chip.js";
import { padEndDisplay } from "./pad.js";
import { applySymbol, splitPrefix } from "./symbol.js";
import type { ChipChrome, LogSpan, PinoLogRecord, SymbolMap } from "../types.js";

export const EVENT_IDENTITY_META_KEYS = [
  "_identity",
  "_identityPlain",
  "_identityRawAnsi",
  "_identityKind",
  "_identityBody",
  "_identityTintKey",
  "_identityChrome",
  "_identityRow2",
  "_identityRow2Plain",
  "_identityRow2RawAnsi",
  "_identityRow2Kind",
  "_identityRow2Body",
  "_identityRow2TintKey",
  "_identityRow2Chrome",
] as const;

function resolveIdentityWidth(width?: number): number {
  return width ?? spec.event.identityWidth;
}

export type ResolvedEventIdentity = {
  display: string;
  tintKey: string;
  chrome: ChipChrome;
  kind?: string;
};

function readChrome(value: unknown): ChipChrome | undefined {
  if (
    value === "fg" ||
    value === "inverted" ||
    value === "fill" ||
    value === "faint" ||
    value === "prefix"
  ) {
    return value;
  }
  return undefined;
}

function resolveIdentityText(
  record: PinoLogRecord,
  row: 1 | 2,
  symbolMap?: SymbolMap,
): string {
  const prefix = row === 2 ? "_identityRow2" : "_identity";
  const kindKey = row === 2 ? "_identityRow2Kind" : "_identityKind";
  const bodyKey = row === 2 ? "_identityRow2Body" : "_identityBody";
  const kind = record[kindKey];
  const body = record[bodyKey];
  if (typeof kind === "string" && typeof body === "string") {
    return applySymbol(kind, body, symbolMap);
  }
  const direct = record[prefix];
  if (typeof direct === "string" && direct.trim()) {
    return direct.trim();
  }
  return "";
}

function chromeForDisplay(display: string, symbolMap?: SymbolMap): ChipChrome {
  return splitPrefix(display, symbolMap) ? "prefix" : "inverted";
}

export function resolveEventIdentity(
  record: PinoLogRecord,
  row: 1 | 2,
  symbolMap?: SymbolMap,
): ResolvedEventIdentity | null {
  const display = resolveIdentityText(record, row, symbolMap);
  if (!display) {
    return null;
  }
  const tintKeyField = row === 2 ? "_identityRow2TintKey" : "_identityTintKey";
  const chromeField = row === 2 ? "_identityRow2Chrome" : "_identityChrome";
  const kindKey = row === 2 ? "_identityRow2Kind" : "_identityKind";
  const tintRaw = record[tintKeyField];
  const tintKey =
    typeof tintRaw === "string" && tintRaw.trim()
      ? tintRaw.trim()
      : display;
  const chrome =
    readChrome(record[chromeField]) ?? chromeForDisplay(display, symbolMap);
  const kind =
    typeof record[kindKey] === "string" ? String(record[kindKey]) : undefined;
  return { display, tintKey, chrome, kind };
}

export function blankIdentityColumnSpan(identityWidth?: number): LogSpan {
  const width = resolveIdentityWidth(identityWidth);
  return {
    text: padEndDisplay("", width),
    role: "message",
  };
}

export function identityColumnSpan(
  record: PinoLogRecord,
  row: 1 | 2,
  symbolMap?: SymbolMap,
  identityWidth?: number,
): LogSpan {
  const width = resolveIdentityWidth(identityWidth);
  const rawKey = row === 2 ? "_identityRow2RawAnsi" : "_identityRawAnsi";
  const rawAnsi = record[rawKey];
  if (typeof rawAnsi === "string" && rawAnsi.length > 0) {
    return { text: rawAnsi, role: "chip", raw: true };
  }
  const plainKey = row === 2 ? "_identityRow2Plain" : "_identityPlain";
  const plainColumn = record[plainKey];
  if (typeof plainColumn === "string" && plainColumn.length > 0) {
    const tintKeyField = row === 2 ? "_identityRow2TintKey" : "_identityTintKey";
    const chromeField = row === 2 ? "_identityRow2Chrome" : "_identityChrome";
    const tintRaw = record[tintKeyField];
    const tintKey =
      typeof tintRaw === "string" && tintRaw.trim() ? tintRaw.trim() : "";
    const chrome = readChrome(record[chromeField]) ?? "inverted";
    if (!tintKey.trim()) {
      return { text: plainColumn, role: "message" };
    }
    const kindKey = row === 2 ? "_identityRow2Kind" : "_identityKind";
    const kind =
      typeof record[kindKey] === "string" ? String(record[kindKey]) : undefined;
    return chipSpan(
      {
        text: plainColumn,
        tintKey,
        chrome,
        kind,
      },
      symbolMap,
    );
  }
  const resolved = resolveEventIdentity(record, row, symbolMap);
  if (!resolved) {
    return blankIdentityColumnSpan(width);
  }
  const padded = padEndDisplay(resolved.display, width);
  if (!resolved.tintKey.trim()) {
    return { text: padded, role: "message" };
  }
  return chipSpan(
    {
      text: padded,
      tintKey: resolved.tintKey,
      chrome: resolved.chrome,
      kind: resolved.kind,
    },
    symbolMap,
  );
}
