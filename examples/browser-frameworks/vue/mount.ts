import { createApp, defineComponent, h, ref } from "vue";
import type { PBLogger } from "../../../src/types.js";
import { pbPlugin, useLogger } from "@westlane/pino-blanc/vue";

const DEMO_MODULE = "Checkout";

export function mountVueDemo(host: HTMLElement | null, logger: PBLogger): void {
  if (!host) {
    return;
  }
  const Comp = defineComponent({
    name: "CheckoutDemo",
    setup() {
      useLogger(DEMO_MODULE);
      const qty = ref(1);
      return () =>
        h("div", { class: "demo-app" }, [
          h("header", { class: "demo-app__head" }, [
            h("h3", { class: "demo-app__title" }, "Checkout"),
            h("p", { class: "demo-app__meta" }, [
              h("code", null, `useLogger("${DEMO_MODULE}")`),
              " via ",
              h("code", null, "pbPlugin"),
            ]),
          ]),
          h("p", { class: "demo-app__copy" }, "Vue adapter: inject plugin + composable."),
          h("div", { class: "demo-app__row" }, [
            h("span", { class: "demo-app__label" }, "Qty"),
            h(
              "button",
              {
                type: "button",
                class: "demo-app__step",
                "aria-label": "Decrease quantity",
                onClick: () => {
                  qty.value = Math.max(1, qty.value - 1);
                },
              },
              "−",
            ),
            h("output", { class: "demo-app__qty" }, String(qty.value)),
            h(
              "button",
              {
                type: "button",
                class: "demo-app__step",
                "aria-label": "Increase quantity",
                onClick: () => {
                  qty.value += 1;
                },
              },
              "+",
            ),
          ]),
        ]);
    },
  });
  createApp(Comp).use(pbPlugin, { logger }).mount(host);
}
