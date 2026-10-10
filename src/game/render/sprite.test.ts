import { describe, expect, it } from "vitest";
import { COLORS } from "../palette";
import {
  blank,
  mirror,
  outline,
  pad,
  rgba,
  rotate,
  silhouette,
  stamp,
} from "./sprite";

describe("sprite helpers", () => {
  it("creates empty canvases and pads sprites", () => {
    expect(blank(3, 2)).toEqual(["...", "..."]);
    expect(pad(["R"])).toEqual(["...", ".R.", "..."]);
  });

  it("mirrors rows for the other facing", () => {
    expect(mirror(["Rb.", ".gk"])).toEqual([".bR", "kg."]);
  });

  it("stamps parts over a base and clips what falls outside", () => {
    expect(stamp(["....", "...."], ["R.", "gb"], 3, 1)).toEqual([
      "....",
      "...R",
    ]);
    expect(stamp(["bb", "bb"], [".R"], 0, 0)).toEqual(["bR", "bb"]);
  });

  it("outlines every opaque shape with ink", () => {
    expect(outline(["...", ".R.", "..."])).toEqual([".k.", "kRk", ".k."]);
  });

  it("turns palette keys into pixels and keeps the rest transparent", () => {
    const pixels = rgba(["R."]);
    const red = Number.parseInt(COLORS.led.slice(1), 16);
    expect([...pixels]).toEqual([
      red >> 16,
      (red >> 8) & 0xff,
      red & 0xff,
      255,
      0,
      0,
      0,
      0,
    ]);
  });

  it("turns a sprite a quarter clockwise", () => {
    expect(rotate(["ab", "cd", "ef"])).toEqual(["eca", "fdb"]);
    expect(rotate(rotate(rotate(rotate(["ab", "cd"]))))).toEqual(["ab", "cd"]);
  });

  it("paints a silhouette over every opaque pixel", () => {
    expect(silhouette(["R.b", ".g."], "w")).toEqual(["w.w", ".w."]);
  });
});
