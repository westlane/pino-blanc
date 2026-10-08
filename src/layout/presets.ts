import { COMPLEX_LAYOUT, DEFAULT_LAYOUT, IDENTITY_LAYOUT } from "./layout-ids.js";
import { layoutData } from "./layout.data.js";
import type { LogLayoutPreset } from "../types/layout.js";

export type { LogLayoutPreset } from "../types/layout.js";
export { COMPLEX_LAYOUT, DEFAULT_LAYOUT, IDENTITY_LAYOUT } from "./layout-ids.js";

/** Legacy ids → current preset names. */
const TEXT_LAYOUT_ALIASES: Record<string, string> = {
  "module-right": DEFAULT_LAYOUT,
  "emoji-module": COMPLEX_LAYOUT,
  "module-first": COMPLEX_LAYOUT,
  classic: COMPLEX_LAYOUT,
};

const EVENT_LAYOUT_ALIASES: Record<string, string> = {
  "identity-meta": DEFAULT_LAYOUT,
  "identity-event": DEFAULT_LAYOUT,
  "identity-stack": COMPLEX_LAYOUT,
};

function preset(id: string, template: string, description: string): LogLayoutPreset {
  return { id, description, template };
}

function textPresets(): Record<string, LogLayoutPreset> {
  const descriptions: Record<string, string> = {
    [DEFAULT_LAYOUT]: "Level, emoji, message, [module]; optional JSON meta on row 2",
    [COMPLEX_LAYOUT]: "Emoji, message, [module] (no level); optional meta on row 2",
    [IDENTITY_LAYOUT]:
      "Identity chip, emoji, message, [module] (no level); optional meta on row 2",
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
    [DEFAULT_LAYOUT]: "Identity chip + event name; second row JSON under the name",
    [COMPLEX_LAYOUT]: "Identity chip on both rows; emoji + event/meta",
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

export const defaultLayout = LOG_LAYOUT_PRESETS[DEFAULT_LAYOUT];
export const complexLayout = LOG_LAYOUT_PRESETS[COMPLEX_LAYOUT];

export const DEFAULT_LOG_LAYOUT_ID = DEFAULT_LAYOUT;

/** First row only (for single-line formatters / tests). Full template may include `%meta%`. */
export const DEFAULT_LOG_LAYOUT = defaultLayout.template.split("\n")[0] ?? "";
/** @deprecated Use `complex` / {@link COMPLEX_LAYOUT} */
export const CLASSIC_LOG_LAYOUT = complexLayout.template.split("\n")[0] ?? "";

export type LogLayoutPresetId = string;
export type LogEventLayoutPresetId = string;

function resolveTextLayoutId(layout?: string): string | undefined {
  if (!layout) {
    return DEFAULT_LAYOUT;
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
  return LOG_LAYOUT_PRESETS[id ?? DEFAULT_LAYOUT].template;
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
