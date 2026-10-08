import { blancEventFormatRecord, formatBlancEventSpans } from "./blanc-event.js";
import { resolveEmojiFromMeta } from "../layout/event-columns.js";
import { formatStandardSpans } from "../layout/line.js";
import { isBlancEventRecord } from "../record.js";
import type {
  CreateLoggerOptions,
  FormatRecord,
  LogSpan,
  PinoLogRecord,
} from "../types.js";
import { levelFromPinoNumber } from "../node/levels.js";

export type ResolvedPinoLine =
  | { mode: "spans"; spans: LogSpan[] }
  | { mode: "line"; line: string }
  | { mode: "empty" };

export function resolvePinoLogLine(
  input: PinoLogRecord,
  options: CreateLoggerOptions,
  columns?: CreateLoggerOptions["columns"],
): ResolvedPinoLine {
  const level = levelFromPinoNumber(input.level);
  const module = String(input.module ?? "app");
  const message = String(input.msg ?? "");
  const defaultSpans = formatStandardSpans(
    level,
    module,
    message,
    options.layout,
    resolveEmojiFromMeta(input),
    input,
  );

  const explicitFormatRecord = options.formatRecord;
  const formatRecord: FormatRecord | undefined =
    explicitFormatRecord ?? blancEventFormatRecord(options);
  if (formatRecord) {
    const custom = formatRecord(input, {
      level,
      module,
      defaultSpans,
      options,
    });
    if (custom === null || custom === undefined) {
      // Built-in event formatter may return null for non-events (fall through).
      // An explicit formatRecord that returns null/undefined means “skip this line”
      // — do not re-layout blanc events with unenriched spans.
      if (isBlancEventRecord(input)) {
        if (explicitFormatRecord) {
          return { mode: "empty" };
        }
        return {
          mode: "spans",
          spans: formatBlancEventSpans(input, {
            module,
            layout: options.layout,
            eventLayout: options.eventLayout,
            symbolMap: options.symbolMap,
            eventIdentityWidth: options.eventIdentityWidth,
          }),
        };
      }
      // fall through to columns + default spans
    } else if (typeof custom === "string") {
      if (!custom) {
        return { mode: "empty" };
      }
      return { mode: "line", line: custom };
    } else if (custom.length === 0) {
      return { mode: "empty" };
    } else {
      return { mode: "spans", spans: custom };
    }
  }

  let spans = defaultSpans;
  const decorator = columns ?? options.columns;
  if (decorator) {
    spans = decorator.decorate(spans, {
      level,
      module,
      meta: input,
    });
  }
  return { mode: "spans", spans };
}
