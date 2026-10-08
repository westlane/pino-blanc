import { mkdtemp, readFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { createLogger } from "../src/node/create.js";

describe("createLogger file transport", () => {
  const dirs: string[] = [];

  afterEach(async () => {
    dirs.length = 0;
  });

  async function tempLogPath(name: string): Promise<string> {
    const dir = await mkdtemp(join(tmpdir(), "pino-blanc-file-"));
    dirs.push(dir);
    return join(dir, name);
  }

  it("writes NDJSON to file with separate file level", async () => {
    const path = await tempLogPath("server.ndjson");
    const log = createLogger("api", {
      level: "debug",
      syncPretty: true,
      plainStdout: true,
      file: { path, level: "warn", mkdir: true },
    });

    log.debug("debug-only");
    log.warn("warn-line");

    const raw = await readFile(path, "utf8");
    expect(raw).not.toContain("debug-only");
    expect(raw).toContain("warn-line");
    expect(raw.trim().split("\n").every((line) => line.startsWith("{"))).toBe(
      true,
    );
  });

  it("accepts file as a string path", async () => {
    const path = await tempLogPath("plain.ndjson");
    const log = createLogger("app", {
      level: "info",
      syncPretty: true,
      plainStdout: true,
      file: path,
    });

    log.info("ready");
    const raw = await readFile(path, "utf8");
    expect(raw).toContain("ready");
  });
});
