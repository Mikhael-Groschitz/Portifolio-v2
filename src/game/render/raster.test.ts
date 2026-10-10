import { describe, expect, it } from "vitest";
import { disc, line, place, plot, raster, rect, rowsOf } from "./raster";

describe("raster", () => {
  it("starts transparent and ignores pixels outside the canvas", () => {
    const target = raster(3, 2);
    plot(target, -1, 0, "R");
    plot(target, 3, 1, "R");
    plot(target, 1.4, 0.6, "R");
    expect(rowsOf(target)).toEqual(["...", ".R."]);
  });

  it("draws lines, rectangles and discs", () => {
    const target = raster(5, 5);
    line(target, [0, 0], [4, 4], "b");
    expect(rowsOf(target).map((row, y) => row[y])).toEqual([
      "b",
      "b",
      "b",
      "b",
      "b",
    ]);
    const box = raster(4, 3);
    rect(box, 1, 1, 2, 1, "g");
    expect(rowsOf(box)).toEqual(["....", ".gg.", "...."]);
    const round = raster(5, 5);
    disc(round, [2, 2], 1, "y");
    expect(rowsOf(round)).toEqual([
      ".....",
      "..y..",
      ".yyy.",
      "..y..",
      ".....",
    ]);
  });

  it("places sprite parts and keeps their transparent pixels see-through", () => {
    const target = raster(4, 2);
    rect(target, 0, 0, 4, 2, "k");
    place(target, ["R.", ".R"], 1, 0);
    expect(rowsOf(target)).toEqual(["kRkk", "kkRk"]);
  });

  it("draws thick lines with a square brush", () => {
    const target = raster(4, 3);
    line(target, [0, 0], [2, 0], "w", 2);
    expect(rowsOf(target)).toEqual(["wwww", "wwww", "...."]);
  });
});
