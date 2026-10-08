import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const RELEASE_BRANCHES = new Set(["dev", "main"]);

export function readBranchFromVersionSvg(badgesDir) {
  const versionPath = path.join(badgesDir, "version.svg");
  if (!fs.existsSync(versionPath)) {
    return null;
  }
  const match = fs.readFileSync(versionPath, "utf8").match(/aria-label="([^:]+):/);
  const label = match?.[1]?.trim();
  return label || null;
}

function gitCurrentBranch(root) {
  try {
    return execSync("git branch --show-current", {
      cwd: root,
      encoding: "utf8",
    }).trim();
  } catch {
    return "";
  }
}

/**
 * Label for docs/badges/version.svg (dev / main on long-lived branches).
 * Topic branches keep the label already committed in version.svg (e.g. promote PRs).
 */
export function resolveBadgeBranch(root) {
  const override = process.env.PINO_BLANC_BADGE_BRANCH?.trim();
  if (override) {
    return override;
  }

  const badgesDir = path.join(root, "docs", "badges");
  const current = gitCurrentBranch(root);
  if (current && RELEASE_BRANCHES.has(current)) {
    return current;
  }

  const headRef = process.env.GITHUB_HEAD_REF?.trim();
  if (headRef && RELEASE_BRANCHES.has(headRef)) {
    return headRef;
  }

  const refName = process.env.GITHUB_REF_NAME?.trim();
  if (refName && RELEASE_BRANCHES.has(refName)) {
    return refName;
  }

  const preserved = readBranchFromVersionSvg(badgesDir);
  if (preserved) {
    return preserved;
  }

  if (headRef) {
    return headRef;
  }
  if (refName && !refName.includes("/")) {
    return refName;
  }
  return current || "dev";
}
