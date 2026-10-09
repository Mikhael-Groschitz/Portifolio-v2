import { describe, expect, it, vi } from "vitest";
import { createQueryStore, cursorOf, queryToRun } from "./query-store";

describe("query store", () => {
  it("starts empty and notifies only real changes", () => {
    const store = createQueryStore();
    const listener = vi.fn();
    store.subscribe(listener);
    expect(store.getSnapshot()).toEqual({
      text: "",
      selectionStart: 0,
      selectionEnd: 0,
    });
    store.update({ text: "HELP", selectionStart: 4, selectionEnd: 4 });
    store.update({ text: "HELP" });
    expect(listener).toHaveBeenCalledTimes(1);
    store.reset();
    expect(store.getSnapshot().text).toBe("");
    expect(listener).toHaveBeenCalledTimes(2);
  });

  it("hands out a focus request once", () => {
    const store = createQueryStore();
    expect(store.takeFocusRequest()).toBe(false);
    store.requestFocus();
    expect(store.takeFocusRequest()).toBe(true);
    expect(store.takeFocusRequest()).toBe(false);
  });

  it("stops notifying after unsubscribing", () => {
    const store = createQueryStore();
    const listener = vi.fn();
    const unsubscribe = store.subscribe(listener);
    unsubscribe();
    store.update({ text: "x" });
    expect(listener).not.toHaveBeenCalled();
  });
});

describe("cursorOf", () => {
  it("counts lines and columns from 1", () => {
    expect(cursorOf("", 0)).toEqual({ line: 1, column: 1 });
    expect(cursorOf("SELECT *\nFROM dbo.About", 13)).toEqual({
      line: 2,
      column: 5,
    });
  });
});

describe("queryToRun", () => {
  it("runs the selection when there is one, else everything", () => {
    const text = "SELECT * FROM dbo.About;\nHELP";
    expect(queryToRun({ text, selectionStart: 3, selectionEnd: 3 })).toBe(text);
    expect(queryToRun({ text, selectionStart: 25, selectionEnd: 29 })).toBe(
      "HELP",
    );
  });
});
