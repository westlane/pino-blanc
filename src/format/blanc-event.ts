import { resolveEventLayoutTemplate } from "../layout/presets.js";
import { resolveEmojiFromMeta } from "../layout/event-columns.js";
import { formatEventLayoutSpans } from "../layout/event-template.js";
import { formatStandardSpans } from "../layout/line.js";
import { isBlancEventRecord } from "../record.js";
import type { CreateLoggerOptions, LogSpan, PinoLogRecord, SymbolMap } from "../types.js";

export function formatBlancEventSpans(
  record: PinoLogRecord,
  ctx: {
    module: string;
    layout?: string | undefined;
    eventLayout?: string | undefined;
    symbolMap?: SymbolMap | undefined;
    eventIdentityWidth?: number | undefined;
  },
): LogSpan[] {
  const eventTemplate = resolveEventLayoutTemplate(ctx.eventLayout);
  if (eventTemplate) {
    return formatEventLayoutSpans(eventTemplate, record, {
      module: ctx.module,
      symbolMap: ctx.symbolMap,
      identityWidth: ctx.eventIdentityWidth,
    });
  }

  // No event presets in layout data → text layout (column widths from text.*).
  return formatStandardSpans(
    "info",
    ctx.module,
    String(record.msg ?? ""),
    ctx.layout,
    resolveEmojiFromMeta(record),
    record,
  );
}

export function blancEventFormatRecord(
  options: CreateLoggerOptions,
): CreateLoggerOptions["formatRecord"] {
  return (record, ctx) => {
    if (!isBlancEventRecord(record)) {
      return null;
    }
    return formatBlancEventSpans(record, {
      module: ctx.module,
      layout: options.layout ?? ctx.options.layout,
      eventLayout: options.eventLayout ?? ctx.options.eventLayout,
      symbolMap: options.symbolMap ?? ctx.options.symbolMap,
      eventIdentityWidth:
        options.eventIdentityWidth ?? ctx.options.eventIdentityWidth,
    });
  };
}
