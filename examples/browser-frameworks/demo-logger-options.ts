import type { CreateLoggerOptions } from "@westlane/pino-blanc/browser";
import type { DemoTabId } from "./tabs";

const DEMO_LAYOUT = {
  layout: "%lv:5% %md:10% %ms:20% %mt%",
  eventLayout: "%mj% %ev:18% %mt%",
  eventNameWidth: 18,
} as const satisfies Pick<
  CreateLoggerOptions,
  "layout" | "eventLayout" | "eventNameWidth"
>;

/** One built-in palette per framework tab (showcases variety in the demo). */
export const DEMO_TAB_THEMES: Record<DemoTabId, string> = {
  vanilla: "solarized-dark",
  react: "dracula",
  vue: "nord",
  svelte: "gruvbox-dark",
};

export function demoLoggerOptionsForTab(tab: DemoTabId): CreateLoggerOptions {
  return {
    ...DEMO_LAYOUT,
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
