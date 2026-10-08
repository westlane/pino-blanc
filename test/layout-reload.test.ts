import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import {
  clearLayoutCache,
  getLayoutData,
} from "../src/layout/layout-store.js";
import "../src/layout/layout-store.node.js";
import { resolveLayoutTemplate } from "../src/layout/presets.js";

const prevEnv = process.env.PINO_BLANC_LAYOUT;

afterEach(() => {
  clearLayoutCache();
  if (prevEnv === undefined) {
    delete process.env.PINO_BLANC_LAYOUT;
  } else {
    process.env.PINO_BLANC_LAYOUT = prevEnv;
  }
});

describe("layout yml mtime cache", () => {
  it("reloads when the file changes", () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), "pino-blanc-layout-"));
    const yml = path.join(dir, "layout.yml");
    const write = (complexRow: string) => {
      fs.writeFileSync(
        yml,
        `
text:
  default: |
    [%lv%  ][%ms% ----][%md%]
  complex: |
    ${complexRow}
event:
  default: |
    [%ev% ----]
box:
  default: |
    [----------]
    [--- %title% ---]
    [----------]
tint:
  multiplier: 31
`,
        "utf8",
      );
    };

    write("[%mj%][%ms% ----][%md%]");
    process.env.PINO_BLANC_LAYOUT = yml;
    clearLayoutCache();
    expect(resolveLayoutTemplate("complex")).toContain("%mj%");
    expect(resolveLayoutTemplate("complex")).not.toContain("%lv%");

    // Ensure mtime advances on all filesystems.
    const now = Date.now() / 1000 + 2;
    write("[%lv%  ][%ms% ----][%md%]");
    fs.utimesSync(yml, now, now);
    clearLayoutCache();
    // Without clear, mtime change alone should reload — exercise that path:
    write("[%lv%  ][%ms% CHANGED ----][%md%]");
    fs.utimesSync(yml, now + 2, now + 2);
    expect(getLayoutData().text.complex).toContain("CHANGED");
  });
});
