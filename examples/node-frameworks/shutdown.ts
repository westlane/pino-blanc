export function registerShutdown(close: () => Promise<void>): void {
  let closing = false;
  const run = async (): Promise<void> => {
    if (closing) {
      return;
    }
    closing = true;
    await close();
    process.exit(0);
  };
  process.once("SIGINT", () => {
    void run();
  });
  process.once("SIGTERM", () => {
    void run();
  });
}
