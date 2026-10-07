import { layoutData } from "./layout.data.js";
import type { LogLayoutPreset } from "../types/layout.js";

export type { LogLayoutPreset } from "../types/layout.js";

const TEXT_LAYOUT_ALIASES: Record<string, string> = {
  default: layoutData.default,
  classic: "module-first",
};

const EVENT_LAYOUT_ALIASES: Record<string, string> = {
  "identity-event": "identity-meta",
};

function preset(id: string, template: string, description: string): LogLayoutPreset {
  return { id, description, template };
}

function textPresets(): Record<string, LogLayoutPreset> {
  const descriptions: Record<string, string> = {
    "module-right": "Level, emoji, message, [module] in the last column",
    "module-first": "Level, [module], then message (no emoji column)",
  };
  return Object.fromEntries(
    Object.entries(layoutData.text).map(([id, template]) => [
      id,
      preset(id, template, descriptions[id] ?? id),
    ]),
  );
}

function eventPresets(): Record<string, LogLayoutPreset> {
  const descriptions: Record<string, string> = {
    "identity-meta": "Identity chip + event name; second row JSON under the name",
  };
  return Object.fromEntries(
    Object.entries(layoutData.event).map(([id, template]) => [
      id,
      preset(id, template, descriptions[id] ?? id),
    ]),
  );
}

export const LOG_LAYOUT_PRESETS = textPresets();
export const LOG_EVENT_LAYOUT_PRESETS = eventPresets();

export const defaultLayout = LOG_LAYOUT_PRESETS[layoutData.default];
export const moduleFirstLayout = LOG_LAYOUT_PRESETS["module-first"];

export const DEFAULT_LOG_LAYOUT_ID = layoutData.default;

export const DEFAULT_LOG_LAYOUT = defaultLayout.template;
/** @deprecated Use `module-first` preset or `LOG_LAYOUT_PRESETS["module-first"].template` */
export const CLASSIC_LOG_LAYOUT = moduleFirstLayout.template;

export type LogLayoutPresetId = keyof typeof LOG_LAYOUT_PRESETS;
export type LogEventLayoutPresetId = keyof typeof LOG_EVENT_LAYOUT_PRESETS;

function resolveTextLayoutId(layout?: string): string | undefined {
  if (!layout) {
    return layoutData.default;
  }
  if (layout.includes("%")) {
    return undefined;
  }
  const id = TEXT_LAYOUT_ALIASES[layout] ?? layout;
  if (!LOG_LAYOUT_PRESETS[id]) {
    const known = Object.keys(LOG_LAYOUT_PRESETS).join(", ");
    throw new Error(`Unknown log layout preset "${layout}". Known: ${known}`);
  }
  return id;
}

export function resolveLayoutTemplate(layout?: string): string {
  if (layout?.includes("%")) {
    return layout;
  }
  const id = resolveTextLayoutId(layout);
  return LOG_LAYOUT_PRESETS[id ?? layoutData.default].template;
}

export function resolveEventLayoutTemplate(eventLayout?: string): string | undefined {
  if (!eventLayout) {
    return undefined;
  }
  if (eventLayout.includes("%") || eventLayout.includes("\n")) {
    return eventLayout;
  }
  const id = EVENT_LAYOUT_ALIASES[eventLayout] ?? eventLayout;
  const entry = LOG_EVENT_LAYOUT_PRESETS[id];
  if (!entry) {
    const known = Object.keys(LOG_EVENT_LAYOUT_PRESETS).join(", ");
    throw new Error(`Unknown log event layout preset "${eventLayout}". Known: ${known}`);
  }
  return entry.template;
}
