import { createContext } from "react";
import type { PBLogger } from "../types.js";

export const PBLoggerContext = createContext<PBLogger | null>(null);
