import { describe, expect, it } from "vitest";
import { readMuted, rememberMuted } from "./sound-preference";

function memory(): Storage {
  const values = new Map<string, string>();
  return {
    get length() {
      return values.size;
    },
    clear: () => values.clear(),
    getItem: (key) => values.get(key) ?? null,
    key: (index) => [...values.keys()][index] ?? null,
    removeItem: (key) => values.delete(key),
    setItem: (key, value) => values.set(key, value),
  };
}

const broken = {
  getItem() {
    throw new Error("blocked");
  },
  setItem() {
    throw new Error("blocked");
  },
} as unknown as Storage;

describe("sound preference", () => {
  it("remembers the choice for the rest of the session", () => {
    const storage = memory();
    expect(readMuted(storage)).toBe(false);
    rememberMuted(true, storage);
    expect(readMuted(storage)).toBe(true);
    rememberMuted(false, storage);
    expect(readMuted(storage)).toBe(false);
  });

  it("plays with sound when the storage is blocked or missing", () => {
    expect(() => rememberMuted(true, broken)).not.toThrow();
    expect(readMuted(broken)).toBe(false);
    expect(readMuted(null)).toBe(false);
  });
});
