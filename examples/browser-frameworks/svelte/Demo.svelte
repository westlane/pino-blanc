<script lang="ts">
  import { onMount } from "svelte";
  import type { PBLogger } from "@westlane/pino-blanc";
  import { getLogger, setPB } from "@westlane/pino-blanc/svelte";

  const DEMO_MODULE = "Checkout";

  let { root }: { root: PBLogger } = $props();

  let qty = $state(1);

  onMount(() => {
    setPB(root);
    getLogger(DEMO_MODULE);
  });
</script>

<div class="demo-app">
  <header class="demo-app__head">
    <h3 class="demo-app__title">Checkout</h3>
    <p class="demo-app__meta">
      <code>getLogger("{DEMO_MODULE}")</code> via <code>setPB</code>
    </p>
  </header>
  <p class="demo-app__copy">Svelte adapter: root logger in context.</p>
  <div class="demo-app__row">
    <span class="demo-app__label">Qty</span>
    <button
      type="button"
      class="demo-app__step"
      aria-label="Decrease quantity"
      onclick={() => {
        qty = Math.max(1, qty - 1);
      }}
    >
      −
    </button>
    <output class="demo-app__qty">{qty}</output>
    <button
      type="button"
      class="demo-app__step"
      aria-label="Increase quantity"
      onclick={() => {
        qty += 1;
      }}
    >
      +
    </button>
  </div>
</div>
