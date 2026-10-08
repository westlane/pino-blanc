import { mount } from "svelte";
import type { PBLogger } from "../../../src/types.js";
import Demo from "./Demo.svelte";

export function mountSvelteDemo(host: HTMLElement | null, root: PBLogger): void {
  if (!host) {
    return;
  }
  mount(Demo, { target: host, props: { root } });
}
