import { describe, expect, it } from "vitest";
import { isExecuteShortcut } from "./execute-shortcut";

function keyEvent(key: string, code: string, modifiers: string[] = []) {
  return {
    key,
    code,
    altKey: modifiers.includes("alt"),
    ctrlKey: modifiers.includes("ctrl"),
    metaKey: modifiers.includes("meta"),
    shiftKey: modifiers.includes("shift"),
  };
}

describe("isExecuteShortcut", () => {
  it("runs on F5 and on Alt+X, like SSMS", () => {
    expect(isExecuteShortcut(keyEvent("F5", "F5"))).toBe(true);
    expect(isExecuteShortcut(keyEvent("x", "KeyX", ["alt"]))).toBe(true);
    expect(isExecuteShortcut(keyEvent("≈", "KeyX", ["alt"]))).toBe(true);
  });

  it("leaves every other combination alone", () => {
    for (const event of [
      keyEvent("F5", "F5", ["ctrl"]),
      keyEvent("F5", "F5", ["shift"]),
      keyEvent("F5", "F5", ["alt"]),
      keyEvent("x", "KeyX"),
      keyEvent("X", "KeyX", ["alt", "shift"]),
      keyEvent("x", "KeyX", ["alt", "ctrl"]),
      keyEvent("x", "KeyX", ["meta"]),
    ]) {
      expect(isExecuteShortcut(event), JSON.stringify(event)).toBe(false);
    }
  });
});
