/** NDJSON / bindings flag set by `BlancLogger.event()` for custom pretty layout. */
export const BLANC_EVENT_KEY = "blancEvent";

/** When true, pretty transport rewrites the previous live block in-place (TTY CSI). */
export const BLANC_LIVE_REPLACE_KEY = "_liveReplace";

export function isBlancEventRecord(
  record: Record<string, unknown> | undefined | null,
): boolean {
  if (!record) {
    return false;
  }
  return record[BLANC_EVENT_KEY] === true;
}

/** Control keys omitted from pretty JSON meta (not user payload). */
export const BLANC_CONTROL_META_KEYS = [
  "_emoji",
  BLANC_LIVE_REPLACE_KEY,
] as const;

/** Default pino binding keys to omit when treating the record as user meta. */
export const PINO_BINDING_KEYS = [
  BLANC_EVENT_KEY,
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
