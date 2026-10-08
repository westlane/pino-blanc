import { createLogger, type CreateLoggerOptions, type PBLogger } from "@westlane/pino-blanc/browser";
import type { LogPreview } from "./demo-preview";
import { logAndPreview, logEventAndPreview } from "./demo-preview";
import {
  adapterFieldsForTab,
  demoLogBurstSchedule,
  pickRandomWineSample,
  type WineSample,
} from "./demo-wine-samples";
import type { DemoTabId } from "./tabs";

export type DemoLogContext = {
  loggerOptionsByTab: Record<DemoTabId, CreateLoggerOptions>;
  frameworkRoots: Pick<Record<DemoTabId, PBLogger>, "react" | "vue" | "svelte">;
  previews: Partial<Record<DemoTabId, LogPreview>>;
};

const pendingBurstTimers = new Map<DemoTabId, ReturnType<typeof setTimeout>[]>();

function clearPendingBurst(tab: DemoTabId): void {
  const timers = pendingBurstTimers.get(tab);
  if (!timers) {
    return;
  }
  for (const timer of timers) {
    clearTimeout(timer);
  }
  pendingBurstTimers.set(tab, []);
}

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

function loggerForSample(
  id: DemoTabId,
  ctx: DemoLogContext,
  sample: WineSample,
): PBLogger | undefined {
  const { loggerOptionsByTab, frameworkRoots } = ctx;
  const loggerOptions = loggerOptionsByTab[id];

  switch (id) {
    case "vanilla":
      return createLogger(sample.module, loggerOptions);
    case "react":
    case "vue":
    case "svelte":
      return frameworkRoots[id].child({ module: sample.module });
    default: {
      const _never: never = id;
      return _never;
    }
  }
}

function emitOneDemoLog(id: DemoTabId, ctx: DemoLogContext): void {
  const preview = ctx.previews[id];
  if (!preview) {
    return;
  }
  const sample = pickRandomWineSample(id);
  const log = loggerForSample(id, ctx, sample);
  if (!log) {
    return;
  }
  emitWineSample(log, preview, id, sample);
}

export function emitDemoLog(id: DemoTabId, ctx: DemoLogContext): void {
  if (!ctx.previews[id]) {
    return;
  }

  clearPendingBurst(id);
  const gaps = demoLogBurstSchedule();
  const timers: ReturnType<typeof setTimeout>[] = [];
  let elapsed = 0;

  for (const gap of gaps) {
    elapsed += gap;
    const timer = setTimeout(() => emitOneDemoLog(id, ctx), elapsed);
    timers.push(timer);
  }

  pendingBurstTimers.set(id, timers);
}
