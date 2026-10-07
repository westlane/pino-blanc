import { describe, expect, it, vi } from "vitest";
import { createBrowserLogger } from "../src/browser/create.js";

describe("redact", () => {
  it("transforms meta before browser emit", () => {
    const info = vi.spyOn(console, "info").mockImplementation(() => {});
    const log = createBrowserLogger("redact-test", {
      redact: (fields) => ({
        ...fields,
        email: fields.email !== undefined ? "[REDACTED]" : fields.email,
      }),
      formatRecord: () => "ok",
    });
    log.info("hi", { email: "a@b.c", count: 1 });
    expect(info).toHaveBeenCalled();
    const line = String(info.mock.calls[0]?.[0] ?? "");
    expect(line).toBe("ok");
    info.mockRestore();
  });

  it("applies redact before formatRecord sees the record", () => {
    const seen: Record<string, unknown>[] = [];
    const info = vi.spyOn(console, "info").mockImplementation(() => {});
    const log = createBrowserLogger("redact-fmt", {
      redact: (fields) => ({ ...fields, secret: "[REDACTED]" }),
      formatRecord: (record) => {
        seen.push(record);
        return "line";
      },
    });
    log.info("x", { secret: "nope", ok: true });
    expect(seen[0]?.secret).toBe("[REDACTED]");
    expect(seen[0]?.ok).toBe(true);
    info.mockRestore();
  });
});
