# @westlane/pino-blanc

[![staging](https://img.shields.io/github/package-json/v/westlane/pino-blanc/main?label=staging)](https://github.com/westlane/pino-blanc/blob/main/package.json)
[![tests](https://img.shields.io/github/actions/workflow/status/westlane/pino-blanc/ci.yml?branch=main&label=tests)](https://github.com/westlane/pino-blanc/actions/workflows/ci.yml)
[![npm](https://img.shields.io/npm/v/@westlane/pino-blanc?label=npm)](https://www.npmjs.com/package/@westlane/pino-blanc)

Themed pretty logging on [Pino](https://getpino.io/) for Node and browser (`%c`).

## Install

```bash
yarn add @westlane/pino-blanc pino
```

## Node

```ts
import { createLogger } from "@westlane/pino-blanc";

const log = createLogger("api", { theme: "solarized-dark" });
log.info("ready", { port: 3030 });
```

### Pino transport (NDJSON peers)

```js
import pino from "pino";

const logger = pino({
  transport: {
    target: "@westlane/pino-blanc/pretty",
    options: { options: { theme: "solarized-light" } },
  },
});
```

Machine logs stay NDJSON — swap `target` to `pino-pretty`, `pino-colada`, etc.

### Frameworks

Pass `createLogger("http").pino` to Fastify, `pino-http`, `nestjs-pino`, `koa-pino-logger`, Hono middleware, etc.

## Browser

```ts
import { createLogger } from "@westlane/pino-blanc/browser";

const log = createLogger("preview");
log.info("connected");
```

## Themes

- `solarized-dark` (default when unknown)
- `solarized-light`
- `gruvbox-dark`
- `gruvbox-light`

Env: `PINO_BLANC_THEME=solarized-light`

**Demo:** `yarn demo:themes` (all palettes) or `yarn demo:solarized` (Solarized dark + light with tint-ramp modules, rich events, layouts, and multi-DID banners). `PINO_BLANC_DEMO=gruvbox` limits to Gruvbox pair.

**Live NDJSON:** `yarn demo:live` — simulates WebSocket-style `log.event` ticks through the worker transport, an inline NDJSON→pretty `Writable`, and a shell-style `producer | pretty` pipe. Frame ticks use `_liveReplace: true` so each tick rewrites one terminal block (CSI up + erase) instead of stacking scrollback; a following non-live event (e.g. `ws.batch_done`) commits the last frame. Tune with `PINO_BLANC_LIVE_TICKS`, `PINO_BLANC_LIVE_INTERVAL_MS`, `PINO_BLANC_LIVE_MODE=transport|peer|createLogger|all` (`peer` = inline `Writable`; `createLogger` =  in-process pretty). Integrated terminals (Cursor) often set `NO_COLOR`; `yarn demo:live` forces `FORCE_COLOR=1` so Solarized tints show (disable with `PINO_BLANC_DEMO_FORCE_COLOR=0`).

Line layout and column widths: edit [config/layout.yml](config/layout.yml), then `yarn build`. Palettes: [themes/](themes/) — credits in [themes/README.md](themes/README.md).

### Line layout

Edit [config/layout.yml](config/layout.yml), then `yarn build`.

| Preset id | Applies to | What it is |
| --- | --- | --- |
| **`module-right`** (YAML `default`) | `info` / `warn` / … | Level, emoji slot, message, `[module]` in the last column. |
| **`module-first`** | Same text lines | Level → `[module]` → message (no emoji column). |
| **`identity-meta`** | `log.event()` only | Two rows: identity chip + event name, then JSON under the name. Set `eventLayout: "identity-meta"`. |

Tokens: `%field%`, `%field:width%`, `%field:width:right%` — e.g. `%level:6%`, `%message:34%`, `%module:18%`. `%module%` right-aligns when last. `%event:N%` = event name column. `%identity%`, `%meta%`. Fallback widths: `src/layout/grid-defaults.ts`. `columns` in YAML is only box drawing + `hashShift`.

```ts
createLogger("api"); // YAML `default` → module-right
createLogger("api", { layout: "module-first" });
createLogger("gateway", {
  eventLayout: "identity-meta",
  symbolMap: { host: "/" },
});
log.event("host.ready", { _identityKind: "host", _identityBody: "my-host", port: 3030 });
```

### Line colors

- **Level** — `theme.levels` (e.g. `INFO`, `WARN`, `ERROR` labels).
- **`WARN` / `ERROR`** — entire standard row (level, `[module]`, message) uses that level color.
- **`[module]`** — `createLogger("demo")` sets the binding; the tag gets a stable color from `hash(module) % tintRamp` (see `colorFromId`). Override with `colorize(id, hex)` or a custom `tint` resolver; `theme.roles.module` is not used when `tintKey` is set.
- **Message text** — `theme.roles.message` (except on `WARN` / `ERROR` rows).

## Extensions

- `colorize(id, defaultHex)` — app-specific tint (e.g. DID)
- `redact(fields)` — app PII policy; runs on log fields before each write
- `formatRecord` / `defineFormatRecord()` — full-line pretty override per NDJSON record
- `consolePrettyDelivery` — MCP-style hosts: emit side channel, return `false` to skip stdout
- `buildSessionBannerSpans` / `renderSessionBannerBlock` — full-width DID-tinted session banners (parity)
- `stripPinoBindings`, `isBlancEventRecord`, `consoleLeadingNewlineUnless` — record helpers
- `_liveReplace: true` on a record — pretty transport overwrites the previous live block in-place (high-frequency ticks / WS frames)
- `tint` / `columns` — `TintResolver` and `ColumnDecorator` hooks
- `themeOverrides` — partial theme merge
- `forceColor` — default **on** for `createLogger` (pretty ANSI even when Cursor sets `NO_COLOR`). Opt out: `forceColor: false`, `PINO_BLANC_FORCE_COLOR=0`, or `PINO_BLANC_PLAIN=1`.
- `ansiMode` / `PINO_BLANC_ANSI` — `auto` (default) uses **256-color** when `COLORTERM` is unset (Cursor integrated terminal); set `truecolor` or `PINO_BLANC_ANSI=truecolor` for iTerm. Run `yarn verify:ansi` after build.
- `log.event(msg, meta)` — writes at info with `blancEvent: true` for custom layouts
- `renderBannerLine(title, theme)` — centered box headline using `theme.roles.box`

## Branches

| Branch | Role | CI | Badges |
| --- | --- | --- | --- |
| `dev` | day-to-day work | [`ci`](https://github.com/westlane/pino-blanc/actions/workflows/ci.yml) on push + PR | — |
| `main` | staging | same on merge from `dev` | **staging** + **tests** (GitHub; track `main`) |
| `prod` | release | `ci` + [`publish`](https://github.com/westlane/pino-blanc/actions/workflows/publish.yml) | **npm** (`latest` after publish) |

### Promote `dev` → `main` (staging)

1. Open a PR **dev → main** (only allowed source).
2. CI runs `yarn check` on the PR.
3. Merge → push to `main` runs CI again.
4. Shields refresh: **staging** reads `package.json` on `main`; **tests** shows the latest `ci` run on `main`.

Bump `version` in `package.json` on `dev` when you want staging to advertise a new number before release.

### Promote `main` → `prod` (npm)

1. In the PR **main → prod**, ensure `package.json` `version` is **greater than** the version on npm ([`release-gate`](https://github.com/westlane/pino-blanc/actions/workflows/release-gate.yml) enforces this).
2. CI runs on the PR; merge triggers `publish` on `prod` (`yarn check`, version check, `npm publish`, git tag `v<version>`).
3. **npm** badge updates after publish.

Local gate before push: `yarn check`. Version ahead of registry: `node scripts/check-version-ahead.mjs`.

## License

MIT
