import { createLogger } from "@westlane/pino-blanc/browser";
import { emitDemoLog, type DemoLogContext } from "./demo-log";
import { demoLoggerOptions } from "./demo-logger-options";
import { applyLogHostStyle, createLogPreview } from "./demo-preview";
import { initDemoTabs } from "./tabs";

const loggerOptions = demoLoggerOptions;

function wirePreview(panelId: string): ReturnType<typeof createLogPreview> | undefined {
  const panel = document.getElementById(panelId);
  if (!panel) {
    return undefined;
  }
  applyLogHostStyle(panel, loggerOptions);
  return createLogPreview(panel, loggerOptions);
}

const vanillaPreview = wirePreview("log-preview-vanilla");
const reactPreview = wirePreview("log-preview-react");
const vuePreview = wirePreview("log-preview-vue");
const sveltePreview = wirePreview("log-preview-svelte");

const root = createLogger("app", loggerOptions);

const logContext: DemoLogContext = {
  loggerOptions,
  root,
  previews: {
    vanilla: vanillaPreview,
    react: reactPreview,
    vue: vuePreview,
    svelte: sveltePreview,
  },
};

initDemoTabs({
  defaultTab: "vanilla",
  onActivate: (id) => emitDemoLog(id, logContext),
});
