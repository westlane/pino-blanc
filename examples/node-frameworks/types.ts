import type { PBLogger } from "@westlane/pino-blanc";

export type NodeDemoHandle = {
  log: PBLogger;
  close: () => Promise<void>;
};

export type StartNodeDemo = (port: number) => Promise<NodeDemoHandle>;
