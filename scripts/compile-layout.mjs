import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { load as loadYaml } from "js-yaml";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const ymlPath = path.join(root, "config", "layout.yml");
const tsPath = path.join(root, "src", "layout", "layout.data.ts");

const raw = fs.readFileSync(ymlPath, "utf8");
const doc = loadYaml(raw);

if (!doc.default || typeof doc.default !== "string") {
  throw new Error("layout.yml: `default` must name a preset under `text`");
}
if (!doc.text || typeof doc.text !== "object") {
  throw new Error("layout.yml: `text` presets are required");
}
if (!doc.text[doc.default]) {
  throw new Error(`layout.yml: default "${doc.default}" is not defined under text`);
}
if (!doc.event || typeof doc.event !== "object") {
  throw new Error("layout.yml: `event` presets are required");
}
if (!doc.columns || typeof doc.columns !== "object") {
  throw new Error("layout.yml: `columns` section is required");
}

for (const section of ["text", "event"]) {
  for (const [id, template] of Object.entries(doc[section])) {
    if (typeof template !== "string" || !template.includes("%")) {
      throw new Error(`layout.yml: ${section}.${id} must be a template string`);
    }
    doc[section][id] = template.trimEnd();
  }
}

const body = `// Generated from config/layout.yml — do not edit.
import type { LayoutData } from "../types/layout.js";

export const layoutData: LayoutData = ${JSON.stringify(doc, null, 2)};

export const spec = layoutData.columns;
`;

fs.writeFileSync(tsPath, body, "utf8");
console.log(`Wrote ${path.relative(root, tsPath)}`);
