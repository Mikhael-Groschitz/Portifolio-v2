import { describe, expect, it } from "vitest";
import { random } from "./random";

describe("random", () => {
  it("repeats the same numbers for the same seed", () => {
    const first = { seed: 42 };
    const second = { seed: 42 };
    const a = Array.from({ length: 5 }, () => random(first));
    const b = Array.from({ length: 5 }, () => random(second));
    expect(a).toEqual(b);
    expect(new Set(a).size).toBe(5);
  });

  it("stays between zero and one", () => {
    const state = { seed: Date.UTC(2026, 9, 9) };
    for (let index = 0; index < 1000; index++) {
      const value = random(state);
      expect(value).toBeGreaterThanOrEqual(0);
      expect(value).toBeLessThan(1);
    }
  });
});
