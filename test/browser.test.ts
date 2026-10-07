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

  it("createLogger is an alias of createBrowserLogger", () => {
    expect(createLogger).toBe(createBrowserLogger);
  });
});
