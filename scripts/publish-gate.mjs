/**
 * Decide whether a release tag push should npm-publish.
 *
 * Publishes only when all are true:
 * - push is a `v*` tag matching package.json version (tag-driven releases from main)
 * - local version is greater than the registry (or package is unpublished)
 * - NODE_AUTH_TOKEN is set (never printed)
 *
 * Writes GitHub Actions outputs: ahead, version_changed, publish
 */
import { appendFileSync, readFileSync } from "node:fs";
import { execSync } from "node:child_process";

const soft = process.argv.includes("--soft");

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

function tagVersionFromRef(ref) {
  const match = /^refs\/tags\/v(.+)$/.exec(ref);
  return match?.[1] ?? null;
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

const ref = process.env.GITHUB_REF ?? "";
const tagVersion = tagVersionFromRef(ref);

let versionChanged = false;
if (tagVersion) {
  if (tagVersion !== local) {
    console.error(
      `Tag v${tagVersion} does not match package.json version ${local}`,
    );
    process.exit(1);
  }
  versionChanged = true;
} else {
  console.log("skip: publish workflow expects a v* tag push (tag-driven releases from main)");
  process.exit(0);
}

const hasToken = Boolean(process.env.NODE_AUTH_TOKEN?.trim());
const shouldPublish = ahead && versionChanged && hasToken;

writeOutput("ahead", String(ahead));
writeOutput("version_changed", String(versionChanged));
writeOutput("publish", String(shouldPublish));

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
    "skip: release tag is valid, but NPM_TOKEN is not configured as a repository Actions secret",
  );
  process.exit(0);
}

console.log(`publish: ${name}@${local} (registry ${onRegistry ? published : "unpublished"})`);
