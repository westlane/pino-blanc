import { readFileSync } from "node:fs";
import { execSync } from "node:child_process";

const pkg = JSON.parse(readFileSync("package.json", "utf8"));
const local = pkg.version;
const name = pkg.name;

let published = "0.0.0";
try {
  published = execSync(`npm view ${name} version`, { encoding: "utf8" }).trim();
} catch {
  // not on registry yet
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

if (compare(local, published) <= 0) {
  console.error(
    `package.json version ${local} must be greater than npm ${name}@${published}`,
  );
  process.exit(1);
}

console.log(`ok: ${local} > ${published}`);
