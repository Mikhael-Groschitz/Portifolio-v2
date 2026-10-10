import { describe, expect, it } from "vitest";
import { approach, clamp } from "./math";

describe("math helpers", () => {
  it("clamps a value into a range", () => {
    expect(clamp(5, 0, 3)).toBe(3);
    expect(clamp(-2, 0, 3)).toBe(0);
    expect(clamp(2, 0, 3)).toBe(2);
  });

  it("moves toward a target by at most one step", () => {
    expect(approach(0, 10, 3)).toBe(3);
    expect(approach(10, 0, 3)).toBe(7);
    expect(approach(9, 10, 3)).toBe(10);
  });
});
