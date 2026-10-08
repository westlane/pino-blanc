import { describe, expect, it } from "vitest";
import { expandPadBrackets, parseBracketSlot } from "../src/layout/pad-brackets.js";

describe("pad brackets", () => {
  it("uses inner length as max width", () => {
    expect(parseBracketSlot("%lv%--")).toEqual({
      kind: "field",
      token: "lv",
      width: 6,
      minWidth: undefined,
      align: "left",
    });
  });

  it("right-aligns when padding is only before the token", () => {
    expect(parseBracketSlot("--------------%md%")).toMatchObject({
      kind: "field",
      token: "md",
      width: 18,
      align: "right",
    });
  });

  it("centers when padding is on both sides", () => {
    expect(parseBracketSlot(" ---------- %id% ---------- ")).toMatchObject({
      kind: "field",
      token: "id",
      width: 28,
      align: "center",
    });
  });


  it("expands brackets into tokens and pads", () => {
    expect(expandPadBrackets("[%lv%--][%mj%]")).toBe("%lv:6%%mj:4%");
    expect(expandPadBrackets("[------][----]")).toBe(`${" ".repeat(6)}${" ".repeat(4)}`);
  });

  it("keeps rows without brackets unchanged", () => {
    expect(expandPadBrackets("%lv:6% %ms%")).toBe("%lv:6% %ms%");
  });

  it("expands legacy pipe rows so | never leaks into output", () => {
    expect(expandPadBrackets("|%lv%  |%mj%|")).toBe("%lv:6%%mj:4%");
    expect(
      expandPadBrackets(
        "|            %id%            |%mj%|%ev%                        |",
      ),
    ).toBe("%id:28:center%%mj:4%%ev:28%");
  });
});

