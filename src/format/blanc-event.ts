import { resolveEventLayoutTemplate } from "../layout/presets.js";
import { padEventNameColumn, resolveEmojiFromMeta } from "../layout/event-columns.js";
import { formatEventLayoutSpans } from "../layout/event-template.js";
import { formatStandardSpans } from "../layout/line.js";
import { padEndDisplay } from "../layout/pad.js";
import { GRID_DEFAULTS } from "../layout/grid-defaults.js";
import { isBlancEventRecord } from "../record.js";
import type { CreateLoggerOptions, LogSpan, PinoLogRecord, SymbolMap } from "../types.js";

export function formatBlancEventSpans(
  record: PinoLogRecord,
  ctx: {
    module: string;
    layout?: string;
    eventLayout?: string;
    symbolMap?: SymbolMap;
    eventIdentityWidth?: number;
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

  // No eventLayout → same text layout (incl. optional %meta% row from layout.yml).
  const message = String(record.msg ?? "");
  const eventMessage = padEndDisplay(
    padEventNameColumn(message),
    GRID_DEFAULTS.message,
  );
  return formatStandardSpans(
    "info",
    ctx.module,
    eventMessage,
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
