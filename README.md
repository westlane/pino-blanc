# pino-blanc

A themed logger to bring order and beauty to your logging experience. Built around Pino for low overhead compatibility with top frameworks and toolkits (Express, Hapi, Koa, VueJS, React, Svelte, Node). Works for browser console and HTML rendering, too.

### Features

| 🎨 Pre-built color schemes | 📐 Custom spacing and padding     |
| -------------------------- | --------------------------------- |
| ▦ Templates and columns    | ⚡ Progress bars and live-printing |
| 😎 Inline Emojis           | 🪧 Banner layouts                 |

## Preview

![pino-blanc features](docs/features.gif)

<p align="center">
  <a href="https://westlane.github.io/pino-blanc/">
    <img src="https://img.shields.io/badge/Live_Demo-Open_in_browser-0a7ea4?style=for-the-badge&logo=googlechrome&logoColor=white" alt="Live Demo" />
  </a>
</p>

## Install

```bash
yarn add @westlane/pino-blanc
```

![version](docs/badges/version.svg) ![tests](docs/badges/tests.svg)

## Usage

### Browser

```ts
import { createLogger, formatRecordHtml, htmlLogHostStyle } from "@westlane/pino-blanc/browser";

const log = createLogger("app", { theme: "solarized-dark" });
log.verbose("ready", { hello: "world" });

// On-page sink (same colors and column spacing as console %c)
const panel = document.getElementById("logs")!;
panel.style.cssText = htmlLogHostStyle(/* theme */ resolveTheme("solarized-dark"));
const html = formatRecordHtml(
  { level: 30, msg: "ready", module: "app", hello: "world" },
  { theme: "solarized-dark" },
);
if (html) {
  const line = document.createElement("div");
  line.innerHTML = html;
  panel.appendChild(line);
}
```

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
import { createLogger, setPB, getLogger } from "@westlane/pino-blanc/svelte";

const log = createLogger("app", { theme: "dracula-dark" });
// root layout / App.svelte
setPB(log);

// in a child component
const log = getLogger("Checkout");
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

### Try adapters in the browser

The [live demo](https://westlane.github.io/pino-blanc/) opens with a log burst for the active framework tab (Vanilla, React, Vue, or Svelte). Each tab has a dark/light theme pair and a scheme toggle.

[![Live Demo](https://img.shields.io/badge/Live_Demo-Open_in_browser-0a7ea4?style=for-the-badge&logo=googlechrome&logoColor=white)](https://westlane.github.io/pino-blanc/)

Or run locally:

```bash
yarn demo:browser
```

## License

MIT
