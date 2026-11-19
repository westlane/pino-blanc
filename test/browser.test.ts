import { describe, expect, it, vi } from "vitest";
import {
  createBrowserLogger,
  createLogger,
} from "../src/browser.js";

describe("browser", () => {
  it("createBrowserLogger uses console", () => {
    const spy = vi.spyOn(console, "info").mockImplementation(() => {});
    const log = createBrowserLogger("bridge");
    log.info("connected");
    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
  });

  it("createBrowserLogger does not middle-ellipsis module or message", () => {
    const spy = vi.spyOn(console, "info").mockImplementation(() => {});
    const log = createBrowserLogger("clay:socket-manager");
    const msg =
      'connecting to {"url":"ws://localhost:3030"}';
    log.info(msg);
    const printed = String(spy.mock.calls[0]?.[0] ?? "");
    expect(printed).toContain("clay:socket-manager");
    expect(printed).toContain(msg);
    expect(printed).not.toMatch(/\.\.\./);
    spy.mockRestore();
  });

  it("createLogger is an alias of createBrowserLogger", () => {
    expect(createLogger).toBe(createBrowserLogger);
  });

  it("createBrowserLogger works when globalThis.process is missing", () => {
    const g = globalThis as { process?: unknown };
    const prev = g.process;
    try {
      delete g.process;
      const spy = vi.spyOn(console, "info").mockImplementation(() => {});
      const log = createBrowserLogger("no-process");
      log.info("ok");
      expect(spy).toHaveBeenCalled();
      spy.mockRestore();
    } finally {
      if (prev !== undefined) {
        g.process = prev;
      }
    }
  });
});
