import { createLogger } from "@westlane/pino-blanc/browser";
import { emitDemoLog, type DemoLogContext } from "./demo-log";
import { demoLoggerOptionsForAllTabs, demoLoggerOptionsForTab } from "./demo-logger-options";
import { applyLogHostStyle, createLogPreview } from "./demo-preview";
import { initDemoTabChrome } from "./demo-tab-chrome";
import { initDemoTabs, parseTabFromHash, type DemoTabId } from "./tabs";

const loggerOptionsByTab = demoLoggerOptionsForAllTabs();

function wirePreview(tab: DemoTabId, panelId: string): ReturnType<typeof createLogPreview> | undefined {
  const panel = document.getElementById(panelId);
  if (!panel) {
    return undefined;
  }
  const options = demoLoggerOptionsForTab(tab);
  applyLogHostStyle(panel, options);
  return createLogPreview(panel, options);
}

const vanillaPreview = wirePreview("vanilla", "log-preview-vanilla");
const reactPreview = wirePreview("react", "log-preview-react");
const vuePreview = wirePreview("vue", "log-preview-vue");
const sveltePreview = wirePreview("svelte", "log-preview-svelte");

const frameworkRoots = {
  react: createLogger("app", loggerOptionsByTab.react),
  vue: createLogger("app", loggerOptionsByTab.vue),
  svelte: createLogger("app", loggerOptionsByTab.svelte),
};

const logContext: DemoLogContext = {
  loggerOptionsByTab,
  frameworkRoots,
  previews: {
    vanilla: vanillaPreview,
    react: reactPreview,
    vue: vuePreview,
    svelte: sveltePreview,
  },
};

const initialTab = parseTabFromHash() ?? "vanilla";

initDemoTabChrome(initialTab);

initDemoTabs({
  defaultTab: initialTab,
  onActivate: (id) => emitDemoLog(id, logContext),
});

document.documentElement.classList.add("demo-ready");
