import { describe, expect, it, vi } from "vitest";
import { createApp, defineComponent, h } from "vue";
import {
  createLogger,
  pbPlugin,
  useLogger,
} from "../src/vue/index.js";

describe("vue adapter (README flow)", () => {
  it("pbPlugin + useLogger scopes module and logs to console", async () => {
    const info = vi.spyOn(console, "info").mockImplementation(() => {});
    const root = createLogger("app", { theme: "nord" });
    const childSpy = vi.spyOn(root, "child");

    const Comp = defineComponent({
      setup() {
        const log = useLogger("Checkout");
        return () =>
          h(
            "button",
            {
              type: "button",
              onClick: () => {
                log.info("mounted");
              },
            },
            "mounted",
          );
      },
    });

    const host = document.createElement("div");
    document.body.appendChild(host);
    const app = createApp(Comp);
    app.use(pbPlugin, { logger: root });
    app.mount(host);

    host.querySelector("button")?.dispatchEvent(
      new MouseEvent("click", { bubbles: true }),
    );

    expect(childSpy).toHaveBeenCalledWith({ module: "Checkout" });
    expect(info).toHaveBeenCalled();
    const [firstArg] = info.mock.calls[0] ?? [];
    expect(String(firstArg)).toContain("mounted");

    app.unmount();
    host.remove();
    info.mockRestore();
    childSpy.mockRestore();
  });
});
