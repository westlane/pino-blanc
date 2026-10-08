import type { CreateLoggerOptions, LogThemeId } from "@westlane/pino-blanc";
import type { DemoFrameworkId } from "./framework-id.js";

const FRAMEWORK_THEMES: Record<DemoFrameworkId, LogThemeId> = {
  http: "dracula-dark",
  express: "solarized-dark",
  koa: "catppuccin-dark",
  hapi: "tokyo-night-dark",
};

function demoLayoutForFramework(id: DemoFrameworkId): CreateLoggerOptions {
  switch (id) {
    case "http":
      return {
        eventLayout: "complex",
        symbolMap: {
          shop: "/",
          guest: "@",
          sku: "#",
          clerk: "*",
          till: "$",
          note: "~",
        },
      };
    case "express":
      return {
        eventLayout: "%mj% %ev:18% %mt%",
      };
    case "koa":
      return {
        layout: "complex",
      };
    case "hapi":
      return {
        layout: "%lv:5% %md:10% %ms:20% %mt%",
      };
    default: {
      const _never: never = id;
      return _never;
    }
  }
}

export function demoLoggerOptionsForFramework(
  id: DemoFrameworkId,
): CreateLoggerOptions {
  return {
    ...demoLayoutForFramework(id),
    theme: FRAMEWORK_THEMES[id],
    syncPretty: true,
    forceColor: true,
    level: "debug",
  };
}
