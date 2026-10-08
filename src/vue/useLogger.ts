import { inject } from "vue";
import { createScopedLogger } from "../adapters/create-scoped.js";
import { requirePBLogger } from "../adapters/require-logger.js";
import type { PBLogger } from "../types.js";
import { pbLoggerKey } from "./key.js";

export const PB_MISSING_PLUGIN =
  "useLogger requires pbPlugin. Call app.use(pbPlugin, { logger }).";

export function useLogger(module?: string): PBLogger {
  const root = requirePBLogger(inject(pbLoggerKey), PB_MISSING_PLUGIN);
  return createScopedLogger(root, module);
}
