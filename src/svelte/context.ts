import { getContext, setContext } from "svelte";
import { createScopedLogger } from "../adapters/create-scoped.js";
import { requirePBLogger } from "../adapters/require-logger.js";
import type { PBLogger } from "../types.js";

/** Context key for advanced `setContext` / `getContext` (mirrors Vue `pbLoggerKey`). */
export const pbLoggerKey = Symbol("pino-blanc");

export const PB_MISSING_CONTEXT =
  "getLogger/useLogger requires setPB in an ancestor component (e.g. root layout).";

export function setPB(logger: PBLogger): void {
  setContext(pbLoggerKey, logger);
}

export function getLogger(module?: string): PBLogger {
  const root = requirePBLogger(
    getContext<PBLogger | undefined>(pbLoggerKey),
    PB_MISSING_CONTEXT,
  );
  return createScopedLogger(root, module);
}

/** Alias of {@link getLogger} for API parity with React/Vue. */
export const useLogger = getLogger;
