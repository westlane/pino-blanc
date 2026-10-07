import { Writable } from "node:stream";
import { resolvePrettyColor } from "../../color/gate.js";
import {
  isLiveReplaceRecord,
  LiveReplaceTracker,
} from "../../format/live-replace.js";
import type { FormatContext } from "../format-record.js";
import { formatPinoLogLine } from "../format-record.js";

export type PrettyTransportOptions = FormatContext & {
  destination?: NodeJS.WritableStream;
};

function formatNdjsonLine(
  line: string,
  opts: PrettyTransportOptions,
  dest: NodeJS.WritableStream,
  plain: boolean,
  live: LiveReplaceTracker,
): void {
  const trimmed = line.trim();
  if (!trimmed) {
    return;
  }
  try {
    const obj = JSON.parse(trimmed) as Record<string, unknown>;
    const record = {
      level: Number(obj.level ?? 30),
      msg: String(obj.msg ?? ""),
      module: String(obj.module ?? obj.name ?? "app"),
      ...obj,
    };
    const formatted = formatPinoLogLine(record, opts, plain);
    if (!formatted) {
      return;
    }
    const out = formatted.endsWith("\n") ? formatted : `${formatted}\n`;
    const writeStdout =
      opts.options.consolePrettyDelivery?.(out, record) ?? true;
    if (writeStdout) {
      dest.write(live.prepare(out, isLiveReplaceRecord(record)));
    }
  } catch {
    live.reset();
    dest.write(`${trimmed}\n`);
  }
}

export default function build(opts: PrettyTransportOptions = { options: {} }) {
  const dest = opts.destination ?? process.stdout;
  const plain = !resolvePrettyColor(opts.options);
  const live = new LiveReplaceTracker();
  return new Writable({
    write(chunk, _enc, cb) {
      const text = chunk.toString();
      const lines = text.split("\n");
      for (const line of lines) {
        formatNdjsonLine(line, opts, dest, plain, live);
      }
      cb();
    },
  });
}
