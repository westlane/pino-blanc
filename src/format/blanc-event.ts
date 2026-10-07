import { resolveEventLayoutTemplate } from "../layout/presets.js";
import { padEventNameColumn, eventRow2TailSpans, resolveEmojiFromMeta } from "../layout/event-columns.js";
import { formatEventLayoutSpans } from "../layout/event-template.js";
import { formatStandardSpans } from "../layout/line.js";
import { padEndDisplay } from "../layout/pad.js";
import { spec } from "../layout/layout.data.js";
import {
  BLANC_CONTROL_META_KEYS,
  isBlancEventRecord,
  stripPinoBindings,
} from "../record.js";
import type { CreateLoggerOptions, LogSpan, PinoLogRecord, SymbolMap } from "../types.js";
import { jsonMetaSpans } from "./json-meta.js";

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

  const message = String(record.msg ?? "");
  const emoji = resolveEmojiFromMeta(record);
  const payload = stripPinoBindings(record, [...BLANC_CONTROL_META_KEYS]);

  const eventMessage = padEndDisplay(
    padEventNameColumn(message),
    spec.messageWidth,
  );
  const spans = formatStandardSpans(
    "info",
    ctx.module,
    eventMessage,
    ctx.layout,
    emoji,
  );

  if (payload && Object.keys(payload).length > 0) {
    spans.push({ text: "\n", role: "message" });
    spans.push(...eventRow2TailSpans());
    spans.push(...jsonMetaSpans(payload));
  }
  return spans;
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
