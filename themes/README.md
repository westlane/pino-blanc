# Built-in themes

Each palette is a `LogTheme` module in this folder (`src/types.ts`). Register new themes in [`index.ts`](index.ts).

Only **open** palettes (permissive licenses) are shipped. Hex values are for logger styling only; see each project for the full specification.

Every family is a symmetrical **`-dark` / `-light`** pair.

## Attribution

| Dark | Light | Source | License | Notes |
| --- | --- | --- | --- | --- |
| `solarized-dark` | `solarized-light` | [Solarized](https://ethanschoonover.com/solarized/) by [Ethan Schoonover](https://github.com/altercation) | [MIT](https://github.com/altercation/solarized/blob/master/LICENSE) | Canonical Solarized. |
| `gruvbox-dark` | `gruvbox-light` | [Gruvbox](https://github.com/morhetz/gruvbox) by [Pavel Pertsev](https://github.com/morhetz) | [MIT](https://github.com/morhetz/gruvbox/blob/master/LICENSE) | Canonical Gruvbox. |
| `tokyo-night-dark` | `tokyo-night-light` | [Tokyo Night](https://github.com/tokyo-night/tokyo-night-vscode-theme) by [enkia](https://github.com/enkia) | [MIT](https://github.com/tokyo-night/tokyo-night-vscode-theme/blob/master/LICENSE.txt) | Night / Light. |
| `dracula-dark` | `dracula-light` | [Dracula](https://draculatheme.com/) by [Zeno Rocha](https://github.com/zenorocha) & contributors | [MIT](https://github.com/dracula/dracula-theme/blob/main/LICENSE) | Classic / Alucard. |
| `catppuccin-dark` | `catppuccin-light` | [Catppuccin](https://github.com/catppuccin/catppuccin) | [MIT](https://github.com/catppuccin/catppuccin/blob/main/LICENSE) | Mocha / Latte flavors. |

Default theme id: `solarized-dark` in [`src/defaults.ts`](../src/defaults.ts).
