import { describe, expect, it, vi } from "vitest";
import { createBrowserLogger } from "../src/browser/create.js";

describe("browser", () => {
  it("createLogger uses console", () => {
    const spy = vi.spyOn(console, "info").mockImplementation(() => {});
    const log = createBrowserLogger("bridge");
    log.info("connected");
    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
  });
});
