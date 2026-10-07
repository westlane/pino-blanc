# Built-in themes

Each palette is a `LogTheme` module in this folder (`src/types.ts`). Register new themes in [`index.ts`](index.ts).

## Attribution

| Theme | Source | Notes |
| --- | --- | --- |
| `solarized-dark` | [Solarized](https://ethanschoonover.com/solarized/) by [Ethan Schoonover](https://github.com/altercation) | Hex values from the canonical Solarized palette (dark background). |
| `solarized-light` | Same as above | Solarized palette (light background). |
| `gruvbox-dark` | [Gruvbox](https://github.com/morhetz/gruvbox) by [Pavel Pertsev](https://github.com/morhetz) | Canonical Gruvbox colors (dark background). |
| `gruvbox-light` | Same as above | Gruvbox palette (light background). |

Solarized is Copyright (c) 2011 Ethan Schoonover and distributed under the [MIT License](https://github.com/altercation/solarized/blob/master/LICENSE). Gruvbox is distributed under the [MIT License](https://github.com/morhetz/gruvbox/blob/master/LICENSE). Hex choices here are for logger styling only; see each project for the full specification.

Default theme id: `solarized-dark` in [`src/defaults.ts`](../src/defaults.ts).
