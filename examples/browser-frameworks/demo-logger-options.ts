import type { CreateLoggerOptions, LogThemeId } from "@westlane/pino-blanc/browser";
import { resolveDemoColorScheme, type DemoColorScheme } from "./demo-scheme";
import type { DemoTabId } from "./tabs";

/** Dark/light palette pair per framework tab. */
export const DEMO_TAB_THEMES: Record<
  DemoTabId,
  { dark: LogThemeId; light: LogThemeId }
> = {
  vanilla: { dark: "dracula-dark", light: "dracula-light" },
  react: { dark: "solarized-dark", light: "solarized-light" },
  vue: { dark: "catppuccin-dark", light: "catppuccin-light" },
  svelte: { dark: "tokyo-night-dark", light: "tokyo-night-light" },
};

export function demoThemeForTab(
  tab: DemoTabId,
  scheme: DemoColorScheme = resolveDemoColorScheme(),
): LogThemeId {
  return DEMO_TAB_THEMES[tab][scheme];
}

/**
 * One layout family per tab: never mix level/module lines with emoji events
 * in the same stream. Sample mode is paired in `demo-wine-samples.ts`.
 */
function demoLayoutForTab(tab: DemoTabId): CreateLoggerOptions {
  switch (tab) {
    case "vanilla":
      return {
        // Identity chip + stacked meta: samples supply `_identity*`.
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
    case "react":
      return {
        // Fixed event column so JSON meta lines up after the name.
        eventLayout: "%mj% %ev:18% %mt%",
      };
    case "vue":
      return {
        layout: "complex",
      };
    case "svelte":
      return {
        layout: "%lv:5% %md:10% %ms:20% %mt%",
      };
    default: {
      const _never: never = tab;
      return _never;
    }
  }
}

export function demoLoggerOptionsForTab(
  tab: DemoTabId,
  scheme: DemoColorScheme = resolveDemoColorScheme(),
): CreateLoggerOptions {
  return {
    ...demoLayoutForTab(tab),
    theme: demoThemeForTab(tab, scheme),
  };
}

export function demoLoggerOptionsForAllTabs(
  scheme: DemoColorScheme = resolveDemoColorScheme(),
): Record<DemoTabId, CreateLoggerOptions> {
  return {
    vanilla: demoLoggerOptionsForTab("vanilla", scheme),
    react: demoLoggerOptionsForTab("react", scheme),
    vue: demoLoggerOptionsForTab("vue", scheme),
    svelte: demoLoggerOptionsForTab("svelte", scheme),
  };
}
