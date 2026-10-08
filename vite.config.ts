import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig, mergeConfig } from "vite";
import example from "./examples/browser-frameworks/vite.config.ts";

const rootDir = path.dirname(fileURLToPath(import.meta.url));

/** Root `vite build` (demo app). Prefer `yarn demo:browser` for dev. */
export default mergeConfig(example, {
  root: path.join(rootDir, "examples/browser-frameworks"),
});
