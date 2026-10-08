import { describe, expect, it, vi } from "vitest";
import { createScopedLogger } from "../src/adapters/create-scoped.js";
import type { PBLogger } from "../src/types.js";

function stubLogger(): PBLogger {
  const child = vi.fn((bindings: { module: string }) => ({
    child,
    tag: bindings.module,
  }));
  return { child } as unknown as PBLogger;
}

describe("createScopedLogger", () => {
  it("returns root when module omitted or empty", () => {
    const root = stubLogger();
    expect(createScopedLogger(root)).toBe(root);
    expect(createScopedLogger(root, "")).toBe(root);
    expect(root.child).not.toHaveBeenCalled();
  });

  it("returns child when module provided", () => {
    const root = stubLogger();
    const scoped = createScopedLogger(root, "Checkout");
    expect(root.child).toHaveBeenCalledWith({ module: "Checkout" });
    expect(scoped).toEqual({ child: root.child, tag: "Checkout" });
  });
});
