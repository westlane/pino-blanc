/**
 * Decide whether a prod push should npm-publish.
 *
 * Publishes only when all are true:
 * - package.json version changed in this push (vs github.event.before)
 * - local version is greater than the registry (or package is unpublished)
 * - NODE_AUTH_TOKEN is set (never printed)
 *
 * Writes GitHub Actions outputs: ahead, version_changed, publish
 */
import { appendFileSync, readFileSync } from "node:fs";
import { execSync } from "node:child_process";

const soft = process.argv.includes("--soft");

function readPkgVersion(source) {
  const raw =
    source === "worktree"
      ? readFileSync("package.json", "utf8")
      : execSync(`git show ${source}:package.json`, {
          encoding: "utf8",
          stdio: ["ignore", "pipe", "ignore"],
        });
  return JSON.parse(raw).version;
}

function compare(a, b) {
  const pa = a.split(".").map((n) => Number.parseInt(n, 10));
  const pb = b.split(".").map((n) => Number.parseInt(n, 10));
  for (let i = 0; i < 3; i++) {
    const x = pa[i] ?? 0;
    const y = pb[i] ?? 0;
    if (x > y) return 1;
    if (x < y) return -1;
  }
  return 0;
}

function writeOutput(key, value) {
  if (!process.env.GITHUB_OUTPUT) {
    return;
  }
  appendFileSync(process.env.GITHUB_OUTPUT, `${key}=${value}\n`);
}

const pkg = JSON.parse(readFileSync("package.json", "utf8"));
const local = pkg.version;
const name = pkg.name;

let published = "0.0.0";
let onRegistry = false;
try {
  published = execSync(`npm view ${name} version`, {
    encoding: "utf8",
    stdio: ["ignore", "pipe", "ignore"],
  }).trim();
  onRegistry = true;
} catch {
  // not on registry yet
}

const ahead = compare(local, published) > 0;

const beforeSha = (process.env.GITHUB_EVENT_BEFORE ?? "").trim();
const zeroSha = /^0+$/.test(beforeSha);
let versionChanged = false;
if (!beforeSha || zeroSha) {
  // First push of the branch: only treat as a release intent if unpublished.
  versionChanged = !onRegistry;
} else {
  try {
    const previous = readPkgVersion(beforeSha);
    versionChanged = previous !== local;
  } catch {
    // Force-push / shallow history: fall back to "did package.json change?"
    try {
      const changed = execSync(`git diff --name-only ${beforeSha} HEAD`, {
        encoding: "utf8",
        stdio: ["ignore", "pipe", "ignore"],
      })
        .split("\n")
        .includes("package.json");
      versionChanged = changed;
    } catch {
      versionChanged = false;
    }
  }
}

const hasToken = Boolean(process.env.NODE_AUTH_TOKEN?.trim());
const shouldPublish = ahead && versionChanged && hasToken;

writeOutput("ahead", String(ahead));
writeOutput("version_changed", String(versionChanged));
writeOutput("publish", String(shouldPublish));

if (!versionChanged) {
  console.log(
    `skip: package.json version unchanged at ${local} (docs/prod sync is safe before first npm release)`,
  );
  process.exit(0);
}

if (!ahead) {
  const msg = `package.json version ${local} is not greater than npm ${name}@${published}`;
  if (soft) {
    console.log(`skip: ${msg}`);
    process.exit(0);
  }
  console.error(msg);
  process.exit(1);
}

if (!hasToken) {
  console.log(
    "skip: version bump is ready to publish, but NPM_TOKEN is not configured as a repository Actions secret",
  );
  process.exit(0);
}

console.log(`publish: ${name}@${local} (registry ${onRegistry ? published : "unpublished"})`);
