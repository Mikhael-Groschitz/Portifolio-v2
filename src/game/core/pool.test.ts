import { describe, expect, it } from "vitest";
import { claim, clearPool, createPool } from "./pool";

describe("pools", () => {
  it("hand out free items and run out without growing", () => {
    const pool = createPool(2, () => ({ active: false, value: 0 }));
    const first = claim(pool);
    const second = claim(pool);
    expect(first).not.toBe(second);
    expect(claim(pool)).toBeNull();
    expect(pool).toHaveLength(2);
    if (first) {
      first.active = false;
    }
    expect(claim(pool)).toBe(first);
  });

  it("free every item at once", () => {
    const pool = createPool(3, () => ({ active: true }));
    clearPool(pool);
    expect(pool.every((item) => !item.active)).toBe(true);
  });
});
