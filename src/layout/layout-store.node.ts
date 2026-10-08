import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { layoutData as bakedLayoutData } from "./layout.data.js";
import { parseLayoutYaml } from "./parse-layout.js";
import {
  setLayoutCacheClearHook,
  setLayoutDataLoader,
} from "./layout-store.js";
import type { LayoutData } from "../types/layout.js";

type Cache = { mtimeMs: number; path: string; data: LayoutData };

let cache: Cache | null = null;

/** Walk up from this module looking for `config/layout.yml`. */
function findLayoutYmlPath(): string | null {
  const env = process.env.PINO_BLANC_LAYOUT?.trim();
  if (env) {
    return path.resolve(env);
  }
  let dir = path.dirname(fileURLToPath(import.meta.url));
  for (let i = 0; i < 8; i += 1) {
    const candidate = path.join(dir, "config", "layout.yml");
    if (fs.existsSync(candidate)) {
      return candidate;
    }
    const parent = path.dirname(dir);
    if (parent === dir) {
      break;
    }
    dir = parent;
  }
  return null;
}

function loadFromYml(): LayoutData {
  const ymlPath = findLayoutYmlPath();
  if (!ymlPath) {
    return bakedLayoutData;
  }
  const mtimeMs = fs.statSync(ymlPath).mtimeMs;
  if (cache && cache.path === ymlPath && cache.mtimeMs === mtimeMs) {
    return cache.data;
  }
  const data = parseLayoutYaml(fs.readFileSync(ymlPath, "utf8"));
  cache = { mtimeMs, path: ymlPath, data };
  return data;
}

/** Wire Node yml hot-reload into {@link getLayoutData}. Idempotent. */
export function installNodeLayoutLoader(): void {
  setLayoutDataLoader(() => {
    try {
      return loadFromYml();
    } catch {
      return bakedLayoutData;
    }
  });
  setLayoutCacheClearHook(() => {
    cache = null;
  });
}

installNodeLayoutLoader();
