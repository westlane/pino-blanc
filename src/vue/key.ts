import type { InjectionKey } from "vue";
import type { PBLogger } from "../types.js";

export const pbLoggerKey: InjectionKey<PBLogger> = Symbol(
  "pino-blanc",
) as InjectionKey<PBLogger>;
