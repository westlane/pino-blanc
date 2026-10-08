export const DEMO_FRAMEWORK_IDS = ["http", "express", "koa", "hapi"] as const;

export type DemoFrameworkId = (typeof DEMO_FRAMEWORK_IDS)[number];

export function parseFrameworkArg(raw: string | undefined): DemoFrameworkId | null {
  if (!raw) {
    return null;
  }
  const id = raw.trim().toLowerCase();
  return (DEMO_FRAMEWORK_IDS as readonly string[]).includes(id)
    ? (id as DemoFrameworkId)
    : null;
}
