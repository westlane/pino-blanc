# @westlane/pino-blanc

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
- `ink`

Env: `PINO_BLANC_THEME=solarized-light`

## Extensions

- `colorTransform(id, defaultHex)` — app-specific tint (e.g. DID)
- `tint` / `columns` — `TintResolver` and `ColumnDecorator` hooks
- `themeOverrides` — partial theme merge

## Branches

- `dev` — development
- `main` — staging (PR from `dev` only)
- `prod` — npm publish (PR from `main` only)

## License

MIT
