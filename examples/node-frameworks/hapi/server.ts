import Hapi from "@hapi/hapi";
import { createLogger } from "@westlane/pino-blanc";
import hapiPino from "hapi-pino";
import { demoLoggerOptionsForFramework } from "../demo-logger-options.js";
import type { StartNodeDemo } from "../types.js";

export const startHapiDemo: StartNodeDemo = async (port) => {
  const log = createLogger("server", demoLoggerOptionsForFramework("hapi"));

  const server = Hapi.server({
    host: "127.0.0.1",
    port,
  });

  await server.register({
    plugin: hapiPino,
    options: {
      instance: log.pino,
    },
  });

  server.route({
    method: "GET",
    path: "/health",
    handler: () => ({ status: "ok" }),
  });

  server.route({
    method: "GET",
    path: "/",
    handler: (request) => {
      request.logger.info({ framework: "hapi" }, "handled root");
      return { framework: "hapi", ok: true };
    },
  });

  await server.start();

  return {
    log,
    close: async () => {
      await server.stop();
    },
  };
};
