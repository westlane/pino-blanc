import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import vue from "@vitejs/plugin-vue";
import { svelte } from "@sveltejs/vite-plugin-svelte";

const exampleRoot = path.dirname(fileURLToPath(import.meta.url));
const pkgRoot = path.resolve(exampleRoot, "../..");

export default defineConfig({
  root: exampleRoot,
  plugins: [
    svelte(),
    vue(),
    react({ include: /\.(jsx|tsx)$/ }),
  ],
  resolve: {
    conditions: ["browser", "import", "module", "default"],
    alias: [
      {
        find: "@westlane/pino-blanc/browser",
        replacement: path.join(pkgRoot, "src/browser.ts"),
      },
      {
        find: "@westlane/pino-blanc/react",
        replacement: path.join(pkgRoot, "src/react/index.ts"),
      },
      {
        find: "@westlane/pino-blanc/vue",
        replacement: path.join(pkgRoot, "src/vue/index.ts"),
      },
      {
        find: "@westlane/pino-blanc/svelte",
        replacement: path.join(pkgRoot, "src/svelte/index.ts"),
      },
      {
        find: "@westlane/pino-blanc",
        replacement: path.join(pkgRoot, "src/index.ts"),
      },
    ],
  },
  server: {
    port: 5179,
    strictPort: true,
  },
});
