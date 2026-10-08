/** Preset id used when `layout` / `eventLayout` / `boxLayout` is omitted. */
export const DEFAULT_LAYOUT = "default" as const;

/** Richer presets in `config/layout.yml` (`text.complex`, `event.complex`, `box.complex`). */
export const COMPLEX_LAYOUT = "complex" as const;

/**
 * @deprecated Alias of {@link COMPLEX_LAYOUT}. `text.identity` was removed —
 * identity chips belong on `event.complex` only.
 */
export const IDENTITY_LAYOUT = COMPLEX_LAYOUT;

export type BuiltinLayoutId = typeof DEFAULT_LAYOUT | typeof COMPLEX_LAYOUT;
