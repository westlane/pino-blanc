import type { FormatRecord, FormatRecordContext, PinoLogRecord } from "../types.js";

export type FormatRecordLineFn = (
  record: PinoLogRecord,
  ctx: FormatRecordContext,
) => string;

/**
 * Build a {@link FormatRecord} that merges `module` from ctx and returns a full line string.
 */
export function defineFormatRecord(formatLine: FormatRecordLineFn): FormatRecord {
  return (record, ctx) => {
    const merged: PinoLogRecord = {
      ...record,
      module: record.module ?? ctx.module,
    };
    return formatLine(merged, ctx);
  };
}
