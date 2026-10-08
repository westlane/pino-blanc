import { createLogger } from "@westlane/pino-blanc";
import express from "express";
import pinoHttp from "pino-http";
import { demoLoggerOptionsForFramework } from "../demo-logger-options.js";
import type { StartNodeDemo } from "../types.js";

export const startExpressDemo: StartNodeDemo = async (port) => {
  const log = createLogger("server", demoLoggerOptionsForFramework("express"));
  const app = express();

  app.use(pinoHttp({ logger: log.pino }));

  app.get("/health", (_req, res) => {
    res.json({ status: "ok" });
  });

  app.get("/", (req, res) => {
    req.log.info({ framework: "express" }, "handled root");
    res.json({ framework: "express", ok: true });
  });

  const server = await new Promise<import("node:http").Server>((resolve, reject) => {
    const listening = app.listen(port, "127.0.0.1", () => resolve(listening));
    listening.once("error", reject);
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
