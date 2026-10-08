/** NDJSON / bindings flag set by `PBLogger.event()` for custom pretty layout. */
export const PB_EVENT_KEY = "pbEvent";

/** When true, pretty transport rewrites the previous live block in-place (TTY CSI). */
export const PB_LIVE_REPLACE_KEY = "_liveReplace";

export function isPBEventRecord(
  record: Record<string, unknown> | undefined | null,
): boolean {
  if (!record) {
    return false;
  }
  return record[PB_EVENT_KEY] === true;
}

/** Control keys omitted from pretty JSON meta (not user payload). */
export const PB_CONTROL_META_KEYS = [
  "_emoji",
  PB_LIVE_REPLACE_KEY,
] as const;

/** Default pino binding keys to omit when treating the record as user meta. */
export const PINO_BINDING_KEYS = [
  PB_EVENT_KEY,
  "level",
  "time",
  "module",
  "msg",
  "pid",
  "hostname",
  "v",
  "name",
] as const;

export function stripPinoBindings(
  record: Record<string, unknown> | undefined,
  extraKeys: string[] = [],
): Record<string, unknown> | undefined {
  if (!record || typeof record !== "object") {
    return record;
  }
  const omit = new Set<string>([...PINO_BINDING_KEYS, ...extraKeys]);
  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(record)) {
    if (!omit.has(key)) {
      out[key] = value;
    }
  }
  return Object.keys(out).length > 0 ? out : undefined;
}
