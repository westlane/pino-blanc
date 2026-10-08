import { COMPLEX_LAYOUT, DEFAULT_LAYOUT } from "./layout-ids.js";
import { getLayoutData } from "./layout-store.js";
import type { LogLayoutPreset } from "../types/layout.js";

export type { LogLayoutPreset } from "../types/layout.js";
export { COMPLEX_LAYOUT, DEFAULT_LAYOUT, IDENTITY_LAYOUT } from "./layout-ids.js";

/** Legacy ids → current preset names. */
const TEXT_LAYOUT_ALIASES: Record<string, string> = {
  "module-right": DEFAULT_LAYOUT,
  "emoji-module": COMPLEX_LAYOUT,
  "module-first": COMPLEX_LAYOUT,
  classic: COMPLEX_LAYOUT,
  /** Removed `text.identity` — identity chips are event-only. */
  identity: COMPLEX_LAYOUT,
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
  const layoutData = getLayoutData();
  const descriptions: Record<string, string> = {
    [DEFAULT_LAYOUT]: "Level, emoji, message, [module]; optional JSON meta on row 2",
    [COMPLEX_LAYOUT]: "Level, emoji, message, [module]; optional meta on row 2",
  };
  return Object.fromEntries(
    Object.entries(layoutData.text).map(([id, template]) => [
      id,
      preset(id, template, descriptions[id] ?? id),
    ]),
  );
}

function eventPresets(): Record<string, LogLayoutPreset> {
  const layoutData = getLayoutData();
  const descriptions: Record<string, string> = {
    [DEFAULT_LAYOUT]: "Emoji + event name; optional JSON meta inline on row 1",
    [COMPLEX_LAYOUT]: "Identity chip on both rows; emoji + event; JSON meta on row 2",
  };
  return Object.fromEntries(
    Object.entries(layoutData.event).map(([id, template]) => [
      id,
      preset(id, template, descriptions[id] ?? id),
    ]),
  );
}

/** Live text presets from `config/layout.yml` (mtime-cached). */
export function getLogLayoutPresets(): Record<string, LogLayoutPreset> {
  return textPresets();
}

/** Live event presets from `config/layout.yml` (mtime-cached). */
export function getLogEventLayoutPresets(): Record<string, LogLayoutPreset> {
  return eventPresets();
}

function livePresetMap(
  load: () => Record<string, LogLayoutPreset>,
): Record<string, LogLayoutPreset> {
  return new Proxy(
    {},
    {
      get(_t, prop) {
        if (typeof prop !== "string") {
          return undefined;
        }
        return load()[prop];
      },
      ownKeys() {
        return Reflect.ownKeys(load());
      },
      getOwnPropertyDescriptor(_t, prop) {
        if (typeof prop !== "string") {
          return undefined;
        }
        const value = load()[prop];
        if (value === undefined) {
          return undefined;
        }
        return { configurable: true, enumerable: true, value };
      },
      has(_t, prop) {
        return typeof prop === "string" && prop in load();
      },
    },
  );
}

/** Live view of text presets (mtime-cached yml). */
export const LOG_LAYOUT_PRESETS: Record<string, LogLayoutPreset> =
  livePresetMap(textPresets);

/** Live view of event presets (mtime-cached yml). */
export const LOG_EVENT_LAYOUT_PRESETS: Record<string, LogLayoutPreset> =
  livePresetMap(eventPresets);

function requireTextPreset(id: string): LogLayoutPreset {
  const preset = textPresets()[id];
  if (!preset) {
    throw new Error(`Missing text layout preset "${id}"`);
  }
  return preset;
}

export function getDefaultLayout(): LogLayoutPreset {
  return requireTextPreset(DEFAULT_LAYOUT);
}

export function getComplexLayout(): LogLayoutPreset {
  return requireTextPreset(COMPLEX_LAYOUT);
}

/** @deprecated Prefer {@link getDefaultLayout}. */
export const defaultLayout = {
  get id() {
    return getDefaultLayout().id;
  },
  get description() {
    return getDefaultLayout().description;
  },
  get template() {
    return getDefaultLayout().template;
  },
} as LogLayoutPreset;

/** @deprecated Prefer {@link getComplexLayout}. */
export const complexLayout = {
  get id() {
    return getComplexLayout().id;
  },
  get description() {
    return getComplexLayout().description;
  },
  get template() {
    return getComplexLayout().template;
  },
} as LogLayoutPreset;

export const DEFAULT_LOG_LAYOUT_ID = DEFAULT_LAYOUT;

/** First row of `text.default` (live from yml). */
export function getDefaultLogLayout(): string {
  return resolveLayoutTemplate(DEFAULT_LAYOUT).split("\n")[0] ?? "";
}

/** First row of `text.complex` (live from yml). */
export function getClassicLogLayout(): string {
  return resolveLayoutTemplate(COMPLEX_LAYOUT).split("\n")[0] ?? "";
}

/**
 * @deprecated Prefer {@link getDefaultLogLayout} — this is evaluated per access via getter object.
 */
export const DEFAULT_LOG_LAYOUT = {
  toString: getDefaultLogLayout,
  valueOf: getDefaultLogLayout,
  [Symbol.toPrimitive]: getDefaultLogLayout,
  split: (...args: Parameters<string["split"]>) => getDefaultLogLayout().split(...args),
  includes: (...args: Parameters<string["includes"]>) =>
    getDefaultLogLayout().includes(...args),
} as unknown as string;

/** @deprecated Prefer {@link getClassicLogLayout}. */
export const CLASSIC_LOG_LAYOUT = {
  toString: getClassicLogLayout,
  valueOf: getClassicLogLayout,
  [Symbol.toPrimitive]: getClassicLogLayout,
  split: (...args: Parameters<string["split"]>) => getClassicLogLayout().split(...args),
} as unknown as string;

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
  const presets = textPresets();
  if (!presets[id]) {
    const known = Object.keys(presets).join(", ");
    throw new Error(`Unknown log layout preset "${layout}". Known: ${known}`);
  }
  return id;
}

export function resolveLayoutTemplate(layout?: string): string {
  if (layout?.includes("%")) {
    return layout;
  }
  const id = resolveTextLayoutId(layout);
  return requireTextPreset(id ?? DEFAULT_LAYOUT).template;
}

export function resolveEventLayoutTemplate(eventLayout?: string): string | undefined {
  if (eventLayout?.includes("%") || eventLayout?.includes("\n")) {
    return eventLayout;
  }
  const id = eventLayout
    ? (EVENT_LAYOUT_ALIASES[eventLayout] ?? eventLayout)
    : DEFAULT_LAYOUT;
  const presets = eventPresets();
  const entry = presets[id];
  if (!entry) {
    // No event presets (or unknown id with no alias) — blanc falls back to text layout.
    if (!eventLayout) {
      return undefined;
    }
    const known = Object.keys(presets).join(", ");
    throw new Error(`Unknown log event layout preset "${eventLayout}". Known: ${known}`);
  }
  return entry.template;
}
