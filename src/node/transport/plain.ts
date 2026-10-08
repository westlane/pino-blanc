import buildPretty from "./pretty.js";
import type { PrettyTransportOptions } from "./pretty.js";

/** Plain stdout (no ANSI): e.g. Clay MCP / JSON-RPC on same stream. */
export default function buildPlain(opts: PrettyTransportOptions = { options: {} }) {
  return buildPretty({
    ...opts,
    options: { ...opts.options, plainStdout: true },
  });
}
