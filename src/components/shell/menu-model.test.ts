import { describe, expect, it } from "vitest";
import { getTexts } from "@/content";
import {
  MENUS,
  MENU_TRIGGERS,
  MORE_MENUS,
  isMenuItem,
  isTabStop,
  wrapIndex,
} from "./menu-model";

const items = MENUS.flatMap((menu) => menu.entries.filter(isMenuItem));

describe("menus", () => {
  it("places every menu item exactly once", () => {
    expect(items.map((item) => item.id).sort()).toEqual(
      Object.keys(getTexts().shell.menu.items).sort(),
    );
  });

  it("follows the menu order of the texts", () => {
    expect(MENUS.map((menu) => menu.id)).toEqual(
      Object.keys(getTexts().shell.menu.menus),
    );
  });

  it("keeps Help visible and folds the other menus on small screens", () => {
    const more = MENU_TRIGGERS.find((trigger) => trigger.id === MORE_MENUS);
    expect(more?.menus.map((menu) => menu.id)).toEqual([
      "file",
      "edit",
      "view",
      "tools",
      "window",
    ]);
    expect(
      MENU_TRIGGERS.find((trigger) => trigger.id === "help")?.visibility,
    ).toBe("always");
  });

  it("only enables the items that already do something", () => {
    expect(items.filter((item) => item.action).map((item) => item.id)).toEqual([
      "newQuery",
      "objectExplorer",
      "language",
      "simpleVersion",
    ]);
  });
});

describe("isTabStop", () => {
  it("starts on the first menu of each layout", () => {
    const stops = MENU_TRIGGERS.filter((trigger) =>
      isTabStop(trigger.id, null),
    ).map((trigger) => trigger.id);
    expect(stops).toEqual([MORE_MENUS, "file"]);
  });

  it("follows the focused menu and keeps the other layout reachable", () => {
    const stopsFor = (focused: (typeof MENU_TRIGGERS)[number]["id"]) =>
      MENU_TRIGGERS.filter((trigger) => isTabStop(trigger.id, focused)).map(
        (trigger) => trigger.id,
      );
    expect(stopsFor("tools")).toEqual([MORE_MENUS, "tools"]);
    expect(stopsFor(MORE_MENUS)).toEqual([MORE_MENUS, "file"]);
    expect(stopsFor("help")).toEqual(["help"]);
  });
});

describe("wrapIndex", () => {
  it("wraps around both ends", () => {
    expect(wrapIndex(-1, 4)).toBe(3);
    expect(wrapIndex(4, 4)).toBe(0);
    expect(wrapIndex(2, 4)).toBe(2);
  });
});
