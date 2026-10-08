import type { PBLogger } from "@westlane/pino-blanc";
import type { DemoFrameworkId } from "./framework-id.js";

const BURST_GAPS_MS = [0, 120, 180, 240];

export function emitDemoBurst(
  framework: DemoFrameworkId,
  log: PBLogger,
): void {
  let elapsed = 0;

  const lines: Array<() => void> = [
    () => log.info("demo listening", { framework, port: "see banner" }),
    () =>
      log.child({ module: "routes" }).debug("registered GET / and GET /health"),
    () =>
      log.event("http.request.sample", {
        method: "GET",
        path: "/",
        status: 200,
        _emoji: "🍷",
      }),
    () =>
      log.child({ module: "cellar" }).info("stock check", {
        sku: "PN-2019",
        qty: 12,
      }),
  ];

  for (let i = 0; i < lines.length; i++) {
    const gap = BURST_GAPS_MS[i] ?? 200;
    elapsed += gap;
    const fn = lines[i];
    if (!fn) {
      continue;
    }
    setTimeout(fn, elapsed);
  }
}
