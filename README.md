# @westlane/pino-blanc

![staging](https://img.shields.io/github/package-json/v/westlane/pino-blanc/main?label=staging)  
![tests](https://img.shields.io/github/actions/workflow/status/westlane/pino-blanc/ci.yml?branch=main&label=tests)  
![npm](https://img.shields.io/npm/v/@westlane/pino-blanc?label=npm)

## Install

```bash
yarn add @westlane/pino-blanc pino
```

## Usage

```ts
import { createLogger } from "@westlane/pino-blanc";

const log = createLogger("api", { theme: "solarized-dark" });
log.info("ready", { port: 3030 });
```

Browser: `@westlane/pino-blanc/browser`. Pino transport: `@westlane/pino-blanc/pretty`.

## Themes

`solarized-dark` (default) · `solarized-light` · `gruvbox-dark` · `gruvbox-light`

Line layout: [config/layout.yml](config/layout.yml)

## License

MIT