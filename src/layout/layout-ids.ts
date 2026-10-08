/** Preset id used when `layout` / `eventLayout` / `boxLayout` is omitted. */
export const DEFAULT_LAYOUT = "default" as const;

/** Richer presets in `config/layout.yml` (`text.complex`, `event.complex`, `box.complex`). */
export const COMPLEX_LAYOUT = "complex" as const;

export type BuiltinLayoutId = typeof DEFAULT_LAYOUT | typeof COMPLEX_LAYOUT;
