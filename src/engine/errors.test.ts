import { describe, expect, it } from "vitest";
import { LOCALES } from "@/content/locales";
import { ERROR_POOL, FRANCHISES, pickError } from "./errors";

describe("error pool", () => {
  it("has five messages for each franchise", () => {
    for (const franchise of FRANCHISES) {
      expect(
        ERROR_POOL.filter((entry) => entry.franchise === franchise),
        franchise,
      ).toHaveLength(5);
    }
  });

  it("never repeats a message number", () => {
    const codes = ERROR_POOL.map((entry) => entry.code);
    expect(new Set(codes).size).toBe(codes.length);
  });

  it("writes every message in every language, short and on one line", () => {
    for (const entry of ERROR_POOL) {
      for (const locale of LOCALES) {
        const text = entry.text[locale];
        expect(text.trim(), `${entry.code} ${locale}`).toBe(text);
        expect(text.length).toBeGreaterThan(0);
        expect(text.length).toBeLessThanOrEqual(80);
        expect(text).not.toContain("\n");
      }
    }
  });

  it("draws any message from the pool, edges included", () => {
    expect(pickError(() => 0)).toBe(ERROR_POOL[0]);
    expect(pickError(() => 0.999999)).toBe(ERROR_POOL.at(-1));
    expect(pickError(() => 1)).toBe(ERROR_POOL.at(-1));
  });
});
