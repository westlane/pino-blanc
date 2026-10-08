#!/usr/bin/env node
/**
 * Writes branch-relative README badges under docs/badges/.
 * Each git branch commits its own SVGs, so viewing /tree/dev vs /tree/main
 * shows that branch's version + test count without hardcoding branch= in README.
 */
import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const badgesDir = path.join(root, "docs", "badges");
const reportPath = path.join(badgesDir, "vitest-report.json");

function resolveBranch() {
  const fromCi = process.env.GITHUB_REF_NAME?.trim();
  if (fromCi) {
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

function escapeXml(text) {
  return String(text)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

/** Approximate shields.io flat badge (no network). */
function shieldsSvg(label, message, color) {
  const charW = 6.5;
  const pad = 10;
  const labelW = Math.ceil(pad * 2 + label.length * charW);
  const messageW = Math.ceil(pad * 2 + message.length * charW);
  const width = labelW + messageW;
  const labelText = escapeXml(label);
  const messageText = escapeXml(message);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="20" role="img" aria-label="${labelText}: ${messageText}">
  <title>${labelText}: ${messageText}</title>
  <linearGradient id="s" x2="0" y2="100%">
    <stop offset="0" stop-color="#bbb" stop-opacity=".1"/>
    <stop offset="1" stop-opacity=".1"/>
  </linearGradient>
  <clipPath id="r"><rect width="${width}" height="20" rx="3" fill="#fff"/></clipPath>
  <g clip-path="url(#r)">
    <rect width="${labelW}" height="20" fill="#555"/>
    <rect x="${labelW}" width="${messageW}" height="20" fill="${color}"/>
    <rect width="${width}" height="20" fill="url(#s)"/>
  </g>
  <g fill="#fff" text-anchor="middle" font-family="Verdana,Geneva,DejaVu Sans,sans-serif" text-rendering="geometricPrecision" font-size="110">
    <text x="${(labelW / 2) * 10}" y="140" transform="scale(.1)" fill="#010101" fill-opacity=".3">${labelText}</text>
    <text x="${(labelW / 2) * 10}" y="150" transform="scale(.1)">${labelText}</text>
    <text x="${(labelW + messageW / 2) * 10}" y="140" transform="scale(.1)" fill="#010101" fill-opacity=".3">${messageText}</text>
    <text x="${(labelW + messageW / 2) * 10}" y="150" transform="scale(.1)">${messageText}</text>
  </g>
</svg>
`;
}

function readTestCounts() {
  if (!fs.existsSync(reportPath)) {
    throw new Error(`Missing vitest report at ${reportPath}`);
  }
  const report = JSON.parse(fs.readFileSync(reportPath, "utf8"));
  const total = Number(report.numTotalTests ?? 0);
  const passed = Number(report.numPassedTests ?? 0);
  const failed = Number(report.numFailedTests ?? 0);
  const skipped = Number(report.numPendingTests ?? report.numSkippedTests ?? 0);
  return { total, passed, failed, skipped };
}

function writeBadge(name, label, message, color) {
  fs.mkdirSync(badgesDir, { recursive: true });
  const out = path.join(badgesDir, `${name}.svg`);
  const next = shieldsSvg(label, message, color);
  const prev = fs.existsSync(out) ? fs.readFileSync(out, "utf8") : null;
  if (prev === next) {
    return false;
  }
  fs.writeFileSync(out, next);
  return true;
}

const pkg = JSON.parse(fs.readFileSync(path.join(root, "package.json"), "utf8"));
const branch = resolveBranch();
const { total, passed, failed } = readTestCounts();

const versionChanged = writeBadge(
  "version",
  branch,
  String(pkg.version ?? "0.0.0"),
  "#007ec6",
);

const testsOk = failed === 0 && total > 0;
const testsMessage = testsOk ? `${passed} passed` : `${failed} failed`;
const testsChanged = writeBadge(
  "tests",
  "tests",
  testsMessage,
  testsOk ? "#4c1" : "#e05d44",
);

if (versionChanged || testsChanged) {
  console.log(
    `Updated docs/badges (${branch} ${pkg.version}, tests ${testsMessage})`,
  );
} else {
  console.log(
    `docs/badges up to date (${branch} ${pkg.version}, tests ${testsMessage})`,
  );
}
