import { describe, expect, it, vi, beforeEach } from "vitest";
import { createBrowserLogger } from "../src/browser/create.js";

let contextValue: unknown;

vi.mock("svelte", () => ({
  setContext: (_key: unknown, value: unknown) => {
    contextValue = value;
  },
  getContext: () => contextValue,
}));

import { getLogger, setPB } from "../src/svelte/context.js";

describe("svelte adapter (README flow)", () => {
  beforeEach(() => {
    contextValue = undefined;
  });

  it("setPB + getLogger scopes module and logs to console", () => {
    const info = vi.spyOn(console, "info").mockImplementation(() => {});
    const root = createBrowserLogger("app", { theme: "dracula" });
    const childSpy = vi.spyOn(root, "child");

    setPB(root);
    const log = getLogger("Checkout");
    log.info("svelte click", { via: "setPB" });

    expect(childSpy).toHaveBeenCalledWith({ module: "Checkout" });
    expect(info).toHaveBeenCalled();
    const [firstArg] = info.mock.calls[0] ?? [];
    expect(String(firstArg)).toContain("svelte click");

    info.mockRestore();
    childSpy.mockRestore();
  });

  it("getLogger throws without setPB", () => {
    expect(() => getLogger()).toThrow(/setPB/);
  });
});
