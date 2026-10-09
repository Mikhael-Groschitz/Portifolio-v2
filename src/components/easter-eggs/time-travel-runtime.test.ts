import { describe, expect, it } from "vitest";
import {
  TIME_TRAVEL_STORAGE_KEY,
  markDeparture,
  takeArrival,
} from "./time-travel-runtime";

function fakeStorage() {
  const values = new Map<string, string>();
  return {
    values,
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => {
      values.set(key, value);
    },
    removeItem: (key: string) => {
      values.delete(key);
    },
  };
}

const blockedStorage = {
  getItem: (): string | null => {
    throw new Error("blocked");
  },
  setItem: () => {
    throw new Error("blocked");
  },
  removeItem: () => {
    throw new Error("blocked");
  },
};

describe("time travel marks", () => {
  it("remembers the departure until the window lands again", () => {
    const storage = fakeStorage();
    expect(markDeparture(storage)).toBe(true);
    expect(storage.values.get(TIME_TRAVEL_STORAGE_KEY)).toBe("v1");
    expect(takeArrival(storage)).toBe(true);
    expect(takeArrival(storage)).toBe(false);
    expect(storage.values.size).toBe(0);
  });

  it("only lands after a departure", () => {
    const storage = fakeStorage();
    storage.setItem(TIME_TRAVEL_STORAGE_KEY, "elsewhere");
    expect(takeArrival(storage)).toBe(false);
    expect(storage.values.size).toBe(0);
  });

  it("keeps working when storage is blocked", () => {
    expect(markDeparture(blockedStorage)).toBe(false);
    expect(takeArrival(blockedStorage)).toBe(false);
  });
});
