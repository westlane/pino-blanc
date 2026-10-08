import type { PBLogger } from "../types.js";

/**
 * Return a child logger scoped to `module`, or the root when omitted.
 */
export function createScopedLogger(
  root: PBLogger,
  module?: string,
): PBLogger {
  if (module === undefined || module === "") {
    return root;
  }
  return root.child({ module });
}
