# Built-in themes

Each palette is a `LogTheme` module in this folder (`src/types.ts`). Register new themes in [`index.ts`](index.ts).

Only **open** palettes (permissive licenses) are shipped. Hex values are for logger styling only; see each project for the full specification.

## Attribution

| Theme | Source | License | Notes |
| --- | --- | --- | --- |
| `solarized-dark` | [Solarized](https://ethanschoonover.com/solarized/) by [Ethan Schoonover](https://github.com/altercation) | [MIT](https://github.com/altercation/solarized/blob/master/LICENSE) | Canonical Solarized (dark). |
| `solarized-light` | Same as above | MIT | Solarized (light). |
| `gruvbox-dark` | [Gruvbox](https://github.com/morhetz/gruvbox) by [Pavel Pertsev](https://github.com/morhetz) | [MIT](https://github.com/morhetz/gruvbox/blob/master/LICENSE) | Canonical Gruvbox (dark). |
| `gruvbox-light` | Same as above | MIT | Gruvbox (light). |
| `nord` | [Nord](https://www.nordtheme.com/) by [Sven Greb](https://github.com/svengreb) | [MIT](https://github.com/nordtheme/nord/blob/develop/LICENSE.md) | Arctic Nord palette (dark). |
| `dracula` | [Dracula](https://draculatheme.com/) by [Zeno Rocha](https://github.com/zenorocha) & contributors | [MIT](https://github.com/dracula/dracula-theme/blob/main/LICENSE) | OSS Dracula palette only (not Dracula PRO). |
| `catppuccin-mocha` | [Catppuccin](https://github.com/catppuccin/catppuccin) | [MIT](https://github.com/catppuccin/catppuccin/blob/main/LICENSE) | Mocha flavor (dark). |
| `catppuccin-latte` | Same as above | MIT | Latte flavor (light). |

Default theme id: `solarized-dark` in [`src/defaults.ts`](../src/defaults.ts).
