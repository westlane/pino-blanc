import { useContext } from "react";
import { createScopedLogger } from "../adapters/create-scoped.js";
import { requirePBLogger } from "../adapters/require-logger.js";
import type { PBLogger } from "../types.js";
import { PBLoggerContext } from "./context.js";

export const PB_MISSING_PROVIDER =
  "useLogger requires a PBProvider ancestor. Wrap your app with <PBProvider logger={...}>.";

export function useLogger(module?: string): PBLogger {
  const root = requirePBLogger(
    useContext(PBLoggerContext),
    PB_MISSING_PROVIDER,
  );
  return createScopedLogger(root, module);
}
