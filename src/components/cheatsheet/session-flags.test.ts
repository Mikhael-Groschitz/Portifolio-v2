import { describe, expect, it, vi } from "vitest";
import { readFlag, setFlag, subscribeToFlags } from "./session-flags";

const blockedStorage = {
  getItem: (): string | null => {
    throw new Error("blocked");
  },
  setItem: () => {
    throw new Error("blocked");
  },
};

describe("session flags", () => {
  it("reads what the session already stored", () => {
    expect(readFlag("tables-explored", { getItem: () => "1" })).toBe(true);
    expect(readFlag("tour-seen", { getItem: () => null })).toBe(false);
  });

  it("remembers a flag in memory when storage is blocked", () => {
    const listener = vi.fn();
    const unsubscribe = subscribeToFlags(listener);
    expect(readFlag("tour-seen", blockedStorage)).toBe(false);
    expect(setFlag("tour-seen", blockedStorage)).toBe(false);
    expect(readFlag("tour-seen", blockedStorage)).toBe(true);
    expect(listener).toHaveBeenCalledTimes(1);
    unsubscribe();
  });

  it("stores the flag for the rest of the session", () => {
    const values = new Map<string, string>();
    expect(
      setFlag("tables-explored", {
        setItem: (key, value) => {
          values.set(key, value);
        },
      }),
    ).toBe(true);
    expect(values.get("tables-explored")).toBe("1");
  });
});
