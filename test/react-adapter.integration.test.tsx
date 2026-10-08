// @vitest-environment jsdom
import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  createLogger,
  PBProvider,
  useLogger,
} from "../src/react/index.js";

function LogButton({ label }: { label: string }) {
  const log = useLogger("Checkout");
  return (
    <button type="button" onClick={() => log.info(label)}>
      {label}
    </button>
  );
}

describe("react adapter (README flow)", () => {
  it("PBProvider + useLogger scopes module and logs to console", async () => {
    const info = vi.spyOn(console, "info").mockImplementation(() => {});
    const root = createLogger("app", { theme: "tokyo-night-dark" });
    const childSpy = vi.spyOn(root, "child");

    render(
      <PBProvider logger={root}>
        <LogButton label="mounted" />
      </PBProvider>,
    );

    await userEvent.click(screen.getByRole("button", { name: "mounted" }));

    expect(childSpy).toHaveBeenCalledWith({ module: "Checkout" });
    expect(info).toHaveBeenCalled();
    const [firstArg] = info.mock.calls[0] ?? [];
    expect(String(firstArg)).toContain("mounted");

    info.mockRestore();
    childSpy.mockRestore();
  });
});
