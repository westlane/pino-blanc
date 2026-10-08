import { createLogger } from "@westlane/pino-blanc";
import Koa from "koa";
import koaPino from "koa-pino-logger";
import { demoLoggerOptionsForFramework } from "../demo-logger-options.js";
import type { StartNodeDemo } from "../types.js";

export const startKoaDemo: StartNodeDemo = async (port) => {
  const log = createLogger("server", demoLoggerOptionsForFramework("koa"));
  const app = new Koa();

  app.use(koaPino({ logger: log.pino }));

  app.use(async (ctx) => {
    if (ctx.path === "/health") {
      ctx.body = { status: "ok" };
      return;
    }
    if (ctx.path === "/") {
      ctx.log.info({ framework: "koa" }, "handled root");
      ctx.body = { framework: "koa", ok: true };
      return;
    }
    ctx.status = 404;
    ctx.body = { error: "not_found" };
  });

  const server = app.listen(port, "127.0.0.1");

  await new Promise<void>((resolve) => {
    server.once("listening", () => resolve());
  });

  return {
    log,
    close: async () => {
      await new Promise<void>((resolve, reject) => {
        server.close((err) => (err ? reject(err) : resolve()));
      });
    },
  };
};
