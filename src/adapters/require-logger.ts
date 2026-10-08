import type { PBLogger } from "../types.js";

export function requirePBLogger(
  root: PBLogger | null | undefined,
  message: string,
): PBLogger {
  if (!root) {
    throw new Error(message);
  }
  return root;
}
