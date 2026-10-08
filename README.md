# pino-blanc

![version](https://raw.githubusercontent.com/westlane/pino-blanc/main/docs/badges/version.svg) ![tests](https://raw.githubusercontent.com/westlane/pino-blanc/main/docs/badges/tests.svg)

A themed logger to bring order and beauty to your logging experience. Built around Pino for low overhead compatibility with top frameworks and toolkits (Express, Hapi, Koa, VueJS, React, Svelte, Node). Works for browser console and HTML rendering, too.


| Features                   |                                   |
| -------------------------- | --------------------------------- |
| 🎨 Pre-built color schemes | 📐 Custom spacing and padding     |
| ▦ Templates and columns    | ⚡ Progress bars and live-printing |
| 😎 Emojis inline           | 🪧 Banner layouts                 |




## Install

```bash
yarn add @westlane/pino-blanc
#or
npm install @westlane/pino-blanc
```

[![pino-blanc features](https://raw.githubusercontent.com/westlane/pino-blanc/main/docs/features.gif)](https://westlane.github.io/pino-blanc/)

[![Live Demo](https://img.shields.io/badge/Live_Demo-Open_in_browser-0a7ea4?style=for-the-badge&logo=googlechrome&logoColor=white)](https://westlane.github.io/pino-blanc/)

## Usage



### Node

```ts
import { createLogger } from "@westlane/pino-blanc";

const log = createLogger("server", { theme: "solarized-dark" });
log.info("ready", { port: 3030 });

```



### React

```tsx
import { PBProvider, useLogger, createLogger } from "@westlane/pino-blanc/react";

const log = createLogger("app", { theme: "solarized-dark" });

<PBProvider logger={log}>
  <App />
</PBProvider>

// in a component
const log = useLogger("Checkout");
log.info("mounted");
```



### Vue

```ts
import { createApp } from "vue";
import { createLogger, pbPlugin, useLogger } from "@westlane/pino-blanc/vue";

const log = createLogger("app", { theme: "tokyo-night-dark" });
createApp(App).use(pbPlugin, { logger: log }).mount("#app");

// in setup()
const log = useLogger("Checkout");
```



### Svelte

```ts
import { createLogger, setPB, useLogger } from "@westlane/pino-blanc/svelte";

const log = createLogger("app", { theme: "dracula-dark" });
// root layout / App.svelte
setPB(log);

// in a child component
const log = useLogger("Checkout");
```



### Try adapters in the browser

[![Live Demo](https://img.shields.io/badge/Live_Demo-Open_in_browser-0a7ea4?style=for-the-badge&logo=googlechrome&logoColor=white)](https://westlane.github.io/pino-blanc/)

Or run locally:

```bash
yarn demo:browser
```



### Try on Node (Express, Koa, Hapi)

```bash
yarn demo:node http      # node:http + pino-http
yarn demo:node express   # express + pino-http
yarn demo:node koa       # koa-pino-logger
yarn demo:node hapi      # hapi-pino

curl http://127.0.0.1:3040/health
```



## Advanced



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



## Install

```bash
yarn add @westlane/pino-blanc
#or
npm install @westlane/pino-blanc
```



## License

MIT