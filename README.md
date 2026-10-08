# pino-blanc

A themed logger to bring order to your logging experience:

- advanced color controls
- custom spacing and padding
- templates and columns 
- live printing;

## ![staging](https://img.shields.io/github/package-json/v/westlane/pino-blanc/main?label=staging)

![tests](https://img.shields.io/github/actions/workflow/status/westlane/pino-blanc/ci.yml?branch=main&label=tests)  
![npm](https://img.shields.io/npm/v/@westlane/pino-blanc?label=npm)

## Install

```bash
yarn add @westlane/pino-blanc
```

## Usage

### Browser

```ts
import { createLogger } from "@westlane/pino-blanc/browser";

const log = createLogger("app", { theme: "solarized-dark" });
log.verbose("ready", { hello: "world" });
```

### Node

```ts
import { createLogger } from "@westlane/pino-blanc";

const log = createLogger("server", { theme: "solarized-dark" });
log.info("ready", { port: 3030 });
```



### Multi-Transport

```ts
import pino from "pino";

const transport = pino.transport({
  targets: [
    {
      target: "@westlane/pino-blanc/pretty",
      level: "debug",
      options: { options: { theme: "solarized-dark" } },
    },
    {
      target: "pino/file",
      level: "info",
      options: { destination: "./logs/server.ndjson", mkdir: true },
    },
  ],
});

const log = pino(
  { level: "debug", base: { module: "server" }, timestamp: pino.stdTimeFunctions.isoTime },
  transport,
);

log.info({ port: 3030 }, "ready");
```

## License

MIT