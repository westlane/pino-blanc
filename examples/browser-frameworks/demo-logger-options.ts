import type { CreateLoggerOptions } from "@westlane/pino-blanc/browser";

/** Tighter columns and gutters than `config/layout.yml` text.default (demo panel only). */
export const demoLoggerOptions: CreateLoggerOptions = {
  theme: "solarized-dark",
  layout: "%lv:5% %md:10% %ms:20% %mt%",
  eventLayout: "%mj% %ev:18% %mt%",
  eventNameWidth: 18,
};
