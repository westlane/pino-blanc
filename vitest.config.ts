import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import vue from "@vitejs/plugin-vue";
import { svelte } from "@sveltejs/vite-plugin-svelte";

const rootDir = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [react(), vue(), svelte()],
  resolve: {
    alias: [
      {
        find: "@westlane/pino-blanc/browser",
        replacement: path.join(rootDir, "src/browser.ts"),
      },
      {
        find: "@westlane/pino-blanc/react",
        replacement: path.join(rootDir, "src/react/index.ts"),
      },
      {
        find: "@westlane/pino-blanc/vue",
        replacement: path.join(rootDir, "src/vue/index.ts"),
      },
      {
        find: "@westlane/pino-blanc/svelte",
        replacement: path.join(rootDir, "src/svelte/index.ts"),
      },
      {
        find: "@westlane/pino-blanc",
        replacement: path.join(rootDir, "src/index.ts"),
      },
    ],
  },
  test: {
    include: ["test/**/*.test.ts", "test/**/*.test.tsx"],
    environment: "node",
    environmentMatchGlobs: [
      ["test/**/*.integration.test.{ts,tsx}", "jsdom"],
      ["test/vue-adapter.integration.test.ts", "jsdom"],
      ["test/svelte-adapter.integration.test.ts", "jsdom"],
    ],
  },
});
