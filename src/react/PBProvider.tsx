import type { ReactNode } from "react";
import type { PBLogger } from "../types.js";
import { PBLoggerContext } from "./context.js";

export type PBProviderProps = {
  logger: PBLogger;
  children: ReactNode;
};

export function PBProvider({ logger, children }: PBProviderProps) {
  return (
    <PBLoggerContext.Provider value={logger}>
      {children}
    </PBLoggerContext.Provider>
  );
}
