import { describe, expect, it } from "vitest";
import { placeCard } from "./tour-placement";

const desktop = { width: 1600, height: 1000 };
const phone = { width: 360, height: 740 };
const box = (top: number, left: number, right: number, bottom: number) => ({
  top,
  left,
  right,
  bottom,
});

describe("placeCard", () => {
  it("sits to the right of the target when there is room", () => {
    expect(placeCard(box(200, 10, 300, 224), desktop, "right", 320)).toEqual({
      top: 200,
      left: 312,
    });
  });

  it("falls below the target when the right side is too narrow", () => {
    expect(placeCard(box(100, 10, 300, 140), phone, "right", 320)).toEqual({
      top: 152,
      left: 12,
    });
  });

  it("goes above the target when asked and there is room", () => {
    expect(placeCard(box(600, 320, 1500, 900), desktop, "above", 320)).toEqual({
      bottom: 412,
      left: 320,
    });
  });

  it("goes below instead when the target is near the top", () => {
    expect(placeCard(box(80, 320, 1500, 400), desktop, "above", 320)).toEqual({
      top: 412,
      left: 320,
    });
  });

  it("never leaves the screen sideways", () => {
    expect(placeCard(box(40, 300, 340, 70), phone, "below", 320)).toEqual({
      top: 82,
      left: 28,
    });
  });

  it("centers near the top when the target is missing", () => {
    expect(placeCard(null, desktop, "below", 320)).toEqual({
      top: 72,
      left: 640,
    });
  });
});
