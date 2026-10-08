import http from "node:http";
import { createLogger } from "@westlane/pino-blanc";
import pinoHttp from "pino-http";
import { demoLoggerOptionsForFramework } from "../demo-logger-options.js";
import type { StartNodeDemo } from "../types.js";

export const startHttpDemo: StartNodeDemo = async (port) => {
  const log = createLogger("server", demoLoggerOptionsForFramework("http"));
  const httpLogger = pinoHttp({ logger: log.pino });

  const server = http.createServer((req, res) => {
    httpLogger(req, res);
    const url = req.url ?? "/";

    if (url === "/health") {
      res.writeHead(200, { "content-type": "application/json" });
      res.end(JSON.stringify({ status: "ok" }));
      return;
    }

    if (url === "/" || url.startsWith("/?")) {
      req.log.info({ framework: "http" }, "handled root");
      res.writeHead(200, { "content-type": "application/json" });
      res.end(JSON.stringify({ framework: "http", ok: true }));
      return;
    }

    res.writeHead(404, { "content-type": "application/json" });
    res.end(JSON.stringify({ error: "not_found" }));
  });

  await new Promise<void>((resolve, reject) => {
    server.once("error", reject);
    server.listen(port, "127.0.0.1", () => resolve());
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
