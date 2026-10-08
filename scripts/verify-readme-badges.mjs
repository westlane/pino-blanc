#!/usr/bin/env node
/**
 * CI guard: committed docs/badges/*.svg must match the last `yarn test` badge write.
 * Branch label in version.svg differs per branch (dev vs main); re-run after promote.
 */
import { execSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

function resolveBranch() {
  const headRef = process.env.GITHUB_HEAD_REF?.trim();
  if (headRef) {
    return headRef;
  }
  const fromCi = process.env.GITHUB_REF_NAME?.trim();
  if (fromCi && !fromCi.includes("/")) {
    return fromCi;
  }
  try {
    return execSync("git branch --show-current", {
      cwd: root,
      encoding: "utf8",
    }).trim() || "dev";
  } catch {
    return "dev";
  }
}

try {
  execSync("git diff --exit-code -- docs/badges/", {
    cwd: root,
    stdio: "pipe",
  });
} catch {
  const branch = resolveBranch();
  console.error(
    [
      "README badges under docs/badges/ do not match this branch.",
      "",
      `Expected version badge label: "${branch}" (from package.json on this branch).`,
      "",
      "Fix:",
      `  git checkout ${branch}`,
      "  yarn badges",
      "  git add docs/badges && git commit -m \"chore(docs): sync README badges\"",
      "",
      "After merging dev → main, run the above on main before CI will pass.",
    ].join("\n"),
  );
  process.exit(1);
}
