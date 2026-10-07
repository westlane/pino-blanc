import { Writable } from "node:stream";
import type { FormatContext } from "../format-record.js";
import { formatPinoLogLine } from "../format-record.js";

export type PrettyTransportOptions = FormatContext & {
  destination?: NodeJS.WritableStream;
};

export default function build(opts: PrettyTransportOptions = { options: {} }) {
  const dest = opts.destination ?? process.stdout;
  const plain = Boolean(opts.options.plainStdout);
  return new Writable({
    write(chunk, _enc, cb) {
      try {
        const line = chunk.toString().trim();
        if (!line) {
          cb();
          return;
        }
        const obj = JSON.parse(line) as Record<string, unknown>;
        const formatted = formatPinoLogLine(
          {
            level: Number(obj.level ?? 30),
            msg: String(obj.msg ?? ""),
            module: String(obj.module ?? obj.name ?? "app"),
            ...obj,
          },
          opts,
          plain,
        );
        dest.write(formatted.endsWith("\n") ? formatted : `${formatted}\n`);
        cb();
      } catch {
        dest.write(chunk);
        cb();
      }
    },
  });
}
