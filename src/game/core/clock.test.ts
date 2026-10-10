import { describe, expect, it } from "vitest";
import { STEP_MS, accumulate, framesToMs } from "./clock";

describe("clock", () => {
  it("runs at a fixed 60 steps per second", () => {
    expect(STEP_MS * 60).toBeCloseTo(1000);
    expect(framesToMs(90)).toBeCloseTo(1500);
  });

  it("accumulates frame time but never piles up after a long pause", () => {
    expect(accumulate(4, 16.7)).toBeCloseTo(20.7);
    expect(accumulate(0, 5000)).toBe(250);
    expect(accumulate(10, -3)).toBe(10);
  });
});
