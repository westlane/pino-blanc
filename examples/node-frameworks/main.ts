import { DEMO_PORT } from "./constants.js";
import { emitDemoBurst } from "./demo-log.js";
import { startExpressDemo } from "./express/server.js";
import {
  DEMO_FRAMEWORK_IDS,
  parseFrameworkArg,
  type DemoFrameworkId,
} from "./framework-id.js";
import { startHapiDemo } from "./hapi/server.js";
import { startHttpDemo } from "./http/server.js";
import { startKoaDemo } from "./koa/server.js";
import { registerShutdown } from "./shutdown.js";
import type { StartNodeDemo } from "./types.js";

const STARTERS: Record<DemoFrameworkId, StartNodeDemo> = {
  http: startHttpDemo,
  express: startExpressDemo,
  koa: startKoaDemo,
  hapi: startHapiDemo,
};

function printHelp(): void {
  console.log(
    [
      "pino-blanc node framework demos (official Pino HTTP adapters)",
      "",
      "Usage:",
      "  yarn demo:node <framework>",
      "",
      "Frameworks:",
      ...DEMO_FRAMEWORK_IDS.map((id) => `  ${id}`),
      "",
      `Default port: ${DEMO_PORT} (127.0.0.1)`,
      "",
      "Examples:",
      "  yarn demo:node http",
      "  yarn demo:node express",
      "",
      "Then: curl http://127.0.0.1:3040/health",
    ].join("\n"),
  );
}

async function main(): Promise<void> {
  const framework = parseFrameworkArg(process.argv[2]);
  if (!framework) {
    printHelp();
    if (process.argv[2]) {
      console.error(`\nUnknown framework "${process.argv[2]}".\n`);
      process.exitCode = 1;
    }
    return;
  }

  const start = STARTERS[framework];
  const handle = await start(DEMO_PORT);

  emitDemoBurst(framework, handle.log);
  handle.log.info("server ready", {
    framework,
    host: "127.0.0.1",
    port: DEMO_PORT,
    adapter:
      framework === "http" || framework === "express"
        ? "pino-http"
        : framework === "koa"
          ? "koa-pino-logger"
          : "hapi-pino",
  });

  registerShutdown(handle.close);
}

main().catch((err: unknown) => {
  console.error(err);
  process.exit(1);
});
