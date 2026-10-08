import type { App, Plugin } from "vue";
import type { PBLogger } from "../types.js";
import { pbLoggerKey } from "./key.js";

export type PBPluginOptions = {
  logger: PBLogger;
};

export const pbPlugin: Plugin<PBPluginOptions> = {
  install(app: App, options: PBPluginOptions) {
    app.provide(pbLoggerKey, options.logger);
  },
};
