const DEMO_MODULE = "app";

export function mountVanillaDemo(host: HTMLElement | null): void {
  if (!host) {
    return;
  }
  host.className = "demo-app";
  host.innerHTML = `
    <header class="demo-app__head">
      <h3 class="demo-app__title">Checkout</h3>
      <p class="demo-app__meta"><code>createLogger("${DEMO_MODULE}")</code></p>
    </header>
    <p class="demo-app__copy">Vanilla browser logger — no framework adapter.</p>
    <div class="demo-app__row">
      <span class="demo-app__label">Qty</span>
      <button type="button" class="demo-app__step" data-step="-1" aria-label="Decrease quantity">−</button>
      <output class="demo-app__qty" id="vanilla-qty">1</output>
      <button type="button" class="demo-app__step" data-step="1" aria-label="Increase quantity">+</button>
    </div>
  `;

  const qtyEl = host.querySelector<HTMLOutputElement>("#vanilla-qty");
  let qty = 1;
  const renderQty = (): void => {
    if (qtyEl) {
      qtyEl.textContent = String(qty);
    }
  };

  host.querySelectorAll<HTMLButtonElement>("[data-step]").forEach((button) => {
    button.addEventListener("click", () => {
      const delta = Number(button.dataset.step ?? "0");
      qty = Math.max(1, qty + delta);
      renderQty();
    });
  });
}
