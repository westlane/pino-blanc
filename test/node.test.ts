import { describe, expect, it } from "vitest";
import { formatPinoLogLine } from "../src/node/format-record.js";

describe("node format", () => {
  it("formats pino record plain", () => {
    const line = formatPinoLogLine(
      { level: 30, msg: "hello", module: "api" },
      { options: {} },
      true,
    );
    expect(line).toContain("hello");
    expect(line.includes("\u001B")).toBe(false);
  });
});
