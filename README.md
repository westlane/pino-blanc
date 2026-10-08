# pino-blanc

![staging](https://img.shields.io/github/package-json/v/westlane/pino-blanc/main?label=staging)  
![tests](https://img.shields.io/github/actions/workflow/status/westlane/pino-blanc/ci.yml?branch=main&label=tests)  
![npm](https://img.shields.io/npm/v/@westlane/pino-blanc?label=npm)

A themed cross-platform browser to streamline work with colors, columns and truncation across transports.

## Install

```bash
yarn add @westlane/pino-blanc pino
```

## Usage

### Node

```ts
import { createLogger } from "@westlane/pino-blanc";

const log = createLogger("server", { theme: "solarized-dark" });
log.info("ready", { port: 3030 });
```

### Browser

```ts
import { createLogger } from "@westlane/pino-blanc/browser";

const log = createLogger("app", { theme: "solarized-dark" });
log.verbose("ready", { hello: "world" });
```

## License

MIT