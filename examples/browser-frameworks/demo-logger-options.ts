import type { CreateLoggerOptions } from "@westlane/pino-blanc/browser";
import type { DemoTabId } from "./tabs";

/** One built-in palette per framework tab (showcases variety in the demo). */
export const DEMO_TAB_THEMES: Record<DemoTabId, string> = {
  vanilla: "gruvbox-dark",
  react: "dracula",
  vue: "nord",
  svelte: "solarized-dark",
};

/**
 * One layout family per tab — never mix level/module lines with emoji events
 * in the same stream. Sample mode is paired in `demo-wine-samples.ts`.
 */
function demoLayoutForTab(tab: DemoTabId): CreateLoggerOptions {
  switch (tab) {
    case "vanilla":
      return {
        layout: "%lv:5% %md:10% %ms:20% %mt%",
      };
    case "react":
      return {
        // Bare %ev% (no :N) so names are not ellipsized; no identity column.
        eventLayout: "%mj% %ev% %mt%",
      };
    case "vue":
      return {
        layout: "complex",
      };
    case "svelte":
      return {
        // Identity chip + stacked meta — samples supply `_identity*`.
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
    default: {
      const _never: never = tab;
      return _never;
    }
  }
}

export function demoLoggerOptionsForTab(tab: DemoTabId): CreateLoggerOptions {
  return {
    ...demoLayoutForTab(tab),
    theme: DEMO_TAB_THEMES[tab],
  };
}

export function demoLoggerOptionsForAllTabs(): Record<DemoTabId, CreateLoggerOptions> {
  return {
    vanilla: demoLoggerOptionsForTab("vanilla"),
    react: demoLoggerOptionsForTab("react"),
    vue: demoLoggerOptionsForTab("vue"),
    svelte: demoLoggerOptionsForTab("svelte"),
  };
}
