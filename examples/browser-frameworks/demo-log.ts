import { createLogger, type CreateLoggerOptions, type PBLogger } from "@westlane/pino-blanc/browser";
import type { LogPreview } from "./demo-preview";
import { logAndPreview, logEventAndPreview } from "./demo-preview";
import {
  adapterFieldsForTab,
  pickRandomWineSample,
  type WineSample,
} from "./demo-wine-samples";
import type { DemoTabId } from "./tabs";

export type DemoLogContext = {
  loggerOptionsByTab: Record<DemoTabId, CreateLoggerOptions>;
  frameworkRoots: Pick<Record<DemoTabId, PBLogger>, "react" | "vue" | "svelte">;
  previews: Partial<Record<DemoTabId, LogPreview>>;
};

function emitWineSample(
  log: PBLogger,
  preview: LogPreview,
  tab: DemoTabId,
  sample: WineSample,
): void {
  const baseFields = sample.kind === "line" ? sample.fields : sample.fields;
  const fields = { ...baseFields, ...adapterFieldsForTab(tab) };

  if (sample.kind === "event") {
    logEventAndPreview(log, preview, sample.module, sample.name, fields);
    return;
  }

  logAndPreview(log, preview, sample.level, sample.module, sample.msg, fields);
}

export function emitDemoLog(id: DemoTabId, ctx: DemoLogContext): void {
  const { loggerOptionsByTab, frameworkRoots, previews } = ctx;
  const preview = previews[id];
  if (!preview) {
    return;
  }

  const loggerOptions = loggerOptionsByTab[id];
  const sample = pickRandomWineSample();

  switch (id) {
    case "vanilla": {
      const log = createLogger(sample.module, loggerOptions);
      emitWineSample(log, preview, id, sample);
      return;
    }
    case "react":
    case "vue":
    case "svelte": {
      const log = frameworkRoots[id].child({ module: sample.module });
      emitWineSample(log, preview, id, sample);
      return;
    }
    default: {
      const _never: never = id;
      return _never;
    }
  }
}
