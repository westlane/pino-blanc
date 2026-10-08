import { createLogger, type CreateLoggerOptions, type PBLogger } from "@westlane/pino-blanc/browser";
import { emitDemoLog, type DemoLogContext } from "./demo-log";
import { demoLoggerOptionsForAllTabs } from "./demo-logger-options";
import {
  applyLogHostStyle,
  createLogPreview,
  restyleLogPreview,
} from "./demo-preview";
import { initDemoSchemeToggle, onDemoColorSchemeChange, resolveDemoColorScheme } from "./demo-scheme";
import { initDemoTabChrome } from "./demo-tab-chrome";
import { initDemoTabs, parseTabFromHash, type DemoTabId } from "./tabs";

const TAB_IDS = ["vanilla", "react", "vue", "svelte"] as const satisfies readonly DemoTabId[];

const loggerOptionsByTab: Record<DemoTabId, CreateLoggerOptions> = demoLoggerOptionsForAllTabs();

const previewHosts: Partial<Record<DemoTabId, HTMLElement>> = {};

function wirePreview(tab: DemoTabId, panelId: string): ReturnType<typeof createLogPreview> | undefined {
  const panel = document.getElementById(panelId);
  if (!panel) {
    return undefined;
  }
  previewHosts[tab] = panel;
  applyLogHostStyle(panel, loggerOptionsByTab[tab]);
  return createLogPreview(panel, () => loggerOptionsByTab[tab]);
}

const previews: DemoLogContext["previews"] = {
  vanilla: wirePreview("vanilla", "log-preview-vanilla"),
  react: wirePreview("react", "log-preview-react"),
  vue: wirePreview("vue", "log-preview-vue"),
  svelte: wirePreview("svelte", "log-preview-svelte"),
};

function buildFrameworkRoots(
  optionsByTab: Record<DemoTabId, CreateLoggerOptions>,
): DemoLogContext["frameworkRoots"] {
  return {
    react: createLogger("app", optionsByTab.react),
    vue: createLogger("app", optionsByTab.vue),
    svelte: createLogger("app", optionsByTab.svelte),
  };
}

const frameworkRoots: {
  react: PBLogger;
  vue: PBLogger;
  svelte: PBLogger;
} = buildFrameworkRoots(loggerOptionsByTab);

const logContext: DemoLogContext = {
  loggerOptionsByTab,
  frameworkRoots,
  previews,
};

let activeTab: DemoTabId = parseTabFromHash() ?? "vanilla";

function syncLoggerOptionsToScheme(): void {
  const scheme = resolveDemoColorScheme();
  const next = demoLoggerOptionsForAllTabs(scheme);
  for (const tab of TAB_IDS) {
    loggerOptionsByTab[tab] = next[tab];
    const host = previewHosts[tab];
    if (host) {
      // Retint host + re-color stored lines (same events, no new burst).
      applyLogHostStyle(host, next[tab]);
      restyleLogPreview(host, next[tab]);
    }
  }
  const roots = buildFrameworkRoots(loggerOptionsByTab);
  frameworkRoots.react = roots.react;
  frameworkRoots.vue = roots.vue;
  frameworkRoots.svelte = roots.svelte;
}

initDemoSchemeToggle();
initDemoTabChrome(activeTab);

initDemoTabs({
  defaultTab: activeTab,
  onActivate: (id) => {
    activeTab = id;
    emitDemoLog(id, logContext);
  },
});

onDemoColorSchemeChange(() => {
  syncLoggerOptionsToScheme();
});

document.documentElement.classList.add("demo-ready");
