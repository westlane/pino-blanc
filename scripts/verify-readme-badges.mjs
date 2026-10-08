#!/usr/bin/env node
/**
 * CI / pre-push guard: committed docs/badges/*.svg must match the last `yarn test`.
 */
import { execSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

try {
  execSync("git diff --exit-code -- docs/badges/", {
    cwd: root,
    stdio: "pipe",
  });
} catch {
  console.error(
    [
      "README badges under docs/badges/ are out of date (run tests/badges, then commit).",
      "",
      "Fix:",
      "  yarn badges",
      '  git add docs/badges && git commit -m "chore(docs): sync README badges"',
    ].join("\n"),
  );
  process.exit(1);
}
