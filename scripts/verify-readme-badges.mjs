#!/usr/bin/env node
/**
 * CI / pre-push guard: committed docs/badges/*.svg must match the last `yarn test`.
 */
import { execSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { resolveBadgeBranch } from "./badge-branch.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

try {
  execSync("git diff --exit-code -- docs/badges/", {
    cwd: root,
    stdio: "pipe",
  });
} catch {
  const branch = resolveBadgeBranch(root);
  console.error(
    [
      "README badges under docs/badges/ are out of date (run tests/badges, then commit).",
      "",
      `Version badge label for this run: "${branch}".`,
      "",
      "Fix:",
      "  yarn badges",
      '  git add docs/badges && git commit -m "chore(docs): sync README badges"',
      "",
      "After merging dev → main, on main run:",
      "  git checkout main && yarn badges && git add docs/badges && git commit",
      "",
      "Or override once: PINO_BLANC_BADGE_BRANCH=main yarn badges",
    ].join("\n"),
  );
  process.exit(1);
}
