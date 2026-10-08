/**
 * Bake `src/layout/layout.data.ts` from config/layout.yml (browser / publish fallback).
 * Node runtime reloads the yml via mtime cache — edit layout.yml without rebuilding.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const ymlPath = path.join(root, "config", "layout.yml");
const tsPath = path.join(root, "src", "layout", "layout.data.ts");
const parseUrl = pathToFileURL(
  path.join(root, "src", "layout", "parse-layout.ts"),
).href;

const { parseLayoutYaml } = await import(parseUrl);
const doc = parseLayoutYaml(fs.readFileSync(ymlPath, "utf8"));

const body = `// Generated from config/layout.yml — browser/publish fallback.
// Node reloads config/layout.yml on mtime change (see layout-store.ts).
import type { LayoutData } from "../types/layout.js";

export const layoutData: LayoutData = ${JSON.stringify(doc, null, 2)};

/** Active box preset (\`box.default\`) — metrics for formatBoxLine. */
export const box = layoutData.box.default;
export const tint = layoutData.tint;
`;

fs.writeFileSync(tsPath, body, "utf8");
console.log(`Wrote ${path.relative(root, tsPath)}`);
