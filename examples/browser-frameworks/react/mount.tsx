import { useState } from "react";
import { createRoot } from "react-dom/client";
import type { PBLogger } from "../../../src/types.js";
import { PBProvider, useLogger } from "@westlane/pino-blanc/react";

const DEMO_MODULE = "Checkout";

function CheckoutDemo() {
  useLogger(DEMO_MODULE);
  const [qty, setQty] = useState(1);

  return (
    <div className="demo-app">
      <header className="demo-app__head">
        <h3 className="demo-app__title">Checkout</h3>
        <p className="demo-app__meta">
          <code>useLogger(&quot;{DEMO_MODULE}&quot;)</code> via <code>PBProvider</code>
        </p>
      </header>
      <p className="demo-app__copy">React adapter: scoped child logger from context.</p>
      <div className="demo-app__row">
        <span className="demo-app__label">Qty</span>
        <button
          type="button"
          className="demo-app__step"
          aria-label="Decrease quantity"
          onClick={() => setQty((value) => Math.max(1, value - 1))}
        >
          −
        </button>
        <output className="demo-app__qty">{qty}</output>
        <button
          type="button"
          className="demo-app__step"
          aria-label="Increase quantity"
          onClick={() => setQty((value) => value + 1)}
        >
          +
        </button>
      </div>
    </div>
  );
}

export function mountReactDemo(host: HTMLElement | null, logger: PBLogger): void {
  if (!host) {
    return;
  }
  createRoot(host).render(
    <PBProvider logger={logger}>
      <CheckoutDemo />
    </PBProvider>,
  );
}
