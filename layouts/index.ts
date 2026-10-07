import { classicLayout } from "./classic.js";
import { defaultLayout } from "./default.js";
import { identityEventLayout } from "./identity-event.js";
import type { LogLayoutPreset } from "./types.js";

export type { LogLayoutPreset } from "./types.js";
export { classicLayout } from "./classic.js";
export { defaultLayout } from "./default.js";
export { identityEventLayout } from "./identity-event.js";

export const LOG_LAYOUT_PRESETS = {
  default: defaultLayout,
  classic: classicLayout,
} satisfies Record<string, LogLayoutPreset>;

export const LOG_EVENT_LAYOUT_PRESETS = {
  "identity-event": identityEventLayout,
} satisfies Record<string, LogLayoutPreset>;

export type LogLayoutPresetId = keyof typeof LOG_LAYOUT_PRESETS;
export type LogEventLayoutPresetId = keyof typeof LOG_EVENT_LAYOUT_PRESETS;

export const DEFAULT_LOG_LAYOUT_ID: LogLayoutPresetId = "default";

export const DEFAULT_LOG_LAYOUT = defaultLayout.template;
export const CLASSIC_LOG_LAYOUT = classicLayout.template;

/** Preset id (`default`, `classic`) or a raw `%field%` template string. */
export function resolveLayoutTemplate(layout?: string): string {
  if (!layout) {
    return defaultLayout.template;
  }
  if (layout.includes("%")) {
    return layout;
  }
  const preset = LOG_LAYOUT_PRESETS[layout as LogLayoutPresetId];
  if (!preset) {
    const known = Object.keys(LOG_LAYOUT_PRESETS).join(", ");
    throw new Error(`Unknown log layout preset "${layout}". Known: ${known}`);
  }
  return preset.template;
}

/** Preset id (`identity-event`) or a raw event template (may include `\n` for row 2). */
export function resolveEventLayoutTemplate(eventLayout?: string): string | undefined {
  if (!eventLayout) {
    return undefined;
  }
  if (eventLayout.includes("%") || eventLayout.includes("\n")) {
    return eventLayout;
  }
  const preset = LOG_EVENT_LAYOUT_PRESETS[eventLayout as LogEventLayoutPresetId];
  if (!preset) {
    const known = Object.keys(LOG_EVENT_LAYOUT_PRESETS).join(", ");
    throw new Error(`Unknown log event layout preset "${eventLayout}". Known: ${known}`);
  }
  return preset.template;
}
