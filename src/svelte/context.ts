import { getContext, setContext } from "svelte";
import { createScopedLogger } from "../adapters/create-scoped.js";
import { requirePBLogger } from "../adapters/require-logger.js";
import type { PBLogger } from "../types.js";

const pbContextKey = Symbol("pino-blanc");

export const PB_MISSING_CONTEXT =
  "getLogger requires setPB in an ancestor component (e.g. root layout).";

export function setPB(logger: PBLogger): void {
  setContext(pbContextKey, logger);
}

export function getLogger(module?: string): PBLogger {
  const root = requirePBLogger(
    getContext<PBLogger | undefined>(pbContextKey),
    PB_MISSING_CONTEXT,
  );
  return createScopedLogger(root, module);
}
