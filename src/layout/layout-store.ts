import { layoutData as bakedLayoutData } from "./layout.data.js";
import type { LayoutData } from "../types/layout.js";

type LayoutLoader = () => LayoutData;

let liveLoader: LayoutLoader | null = null;
let cacheClearHook: (() => void) | null = null;

/**
 * Node registers a yml mtime loader (see `layout-store.node.ts`).
 * Browser / unregistered → baked `layout.data.ts` snapshot.
 */
export function setLayoutDataLoader(loader: LayoutLoader | null): void {
  liveLoader = loader;
}

/** Node registers mtime-cache reset for tests. */
export function setLayoutCacheClearHook(hook: (() => void) | null): void {
  cacheClearHook = hook;
}

/**
 * Active layout data. On Node (after {@link installNodeLayoutLoader}), reloads
 * `config/layout.yml` when its mtime changes. Browser → baked snapshot.
 */
export function getLayoutData(): LayoutData {
  if (liveLoader) {
    try {
      return liveLoader();
    } catch {
      return bakedLayoutData;
    }
  }
  return bakedLayoutData;
}

export function getTintMultiplier(): number {
  return getLayoutData().tint.multiplier;
}

/** Test helper — drop the node mtime cache (loader stays installed). */
export function clearLayoutCache(): void {
  cacheClearHook?.();
}
