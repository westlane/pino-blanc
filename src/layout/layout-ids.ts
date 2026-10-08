/** Preset id used when `layout` / `eventLayout` / `boxLayout` is omitted. */
export const DEFAULT_LAYOUT = "default" as const;

/** Richer presets in `config/layout.yml` (`text.complex`, `event.complex`, `box.complex`). */
export const COMPLEX_LAYOUT = "complex" as const;

/** Text row with leading identity chip (`text.identity`). */
export const IDENTITY_LAYOUT = "identity" as const;

export type BuiltinLayoutId =
  | typeof DEFAULT_LAYOUT
  | typeof COMPLEX_LAYOUT
  | typeof IDENTITY_LAYOUT;
