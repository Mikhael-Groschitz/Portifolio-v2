import type { MenuId, MenuItemId } from "@/content/types";

export type MenuCommand = "showExplorer" | "switchLanguage";

export type MenuAction =
  { kind: "command"; command: MenuCommand } | { kind: "link"; href: string };

export interface MenuItem {
  id: MenuItemId;
  shortcut?: string;
  action?: MenuAction;
}

export const SEPARATOR = "separator";

export type MenuEntry = MenuItem | typeof SEPARATOR;

export interface MenuDefinition {
  id: MenuId;
  entries: readonly MenuEntry[];
}

export const MENUS: readonly MenuDefinition[] = [
  {
    id: "file",
    entries: [
      { id: "newQuery", shortcut: "Ctrl+N" },
      { id: "openFile", shortcut: "Ctrl+O" },
      SEPARATOR,
      { id: "save", shortcut: "Ctrl+S" },
    ],
  },
  {
    id: "edit",
    entries: [
      { id: "undo", shortcut: "Ctrl+Z" },
      { id: "redo", shortcut: "Ctrl+Y" },
      SEPARATOR,
      { id: "cut", shortcut: "Ctrl+X" },
      { id: "copy", shortcut: "Ctrl+C" },
      { id: "paste", shortcut: "Ctrl+V" },
    ],
  },
  {
    id: "view",
    entries: [
      {
        id: "objectExplorer",
        action: { kind: "command", command: "showExplorer" },
      },
      { id: "fullScreen", shortcut: "Shift+Alt+Enter" },
    ],
  },
  {
    id: "tools",
    entries: [
      {
        id: "language",
        action: { kind: "command", command: "switchLanguage" },
      },
      SEPARATOR,
      { id: "options" },
    ],
  },
  {
    id: "window",
    entries: [{ id: "closeAllDocuments" }, { id: "resetWindowLayout" }],
  },
  {
    id: "help",
    entries: [
      { id: "cheatsheet" },
      { id: "tour" },
      SEPARATOR,
      { id: "simpleVersion", action: { kind: "link", href: "/simple" } },
    ],
  },
];

export const MORE_MENUS = "more";

export type MenuTriggerId = MenuId | typeof MORE_MENUS;

export type TriggerVisibility = "compact" | "wide" | "always";

export interface MenuTrigger {
  id: MenuTriggerId;
  visibility: TriggerVisibility;
  menus: readonly MenuDefinition[];
}

const PINNED_MENU: MenuId = "help";

export const MENU_TRIGGERS: readonly MenuTrigger[] = [
  {
    id: MORE_MENUS,
    visibility: "compact",
    menus: MENUS.filter((menu) => menu.id !== PINNED_MENU),
  },
  ...MENUS.map((menu): MenuTrigger => ({
    id: menu.id,
    visibility: menu.id === PINNED_MENU ? "always" : "wide",
    menus: [menu],
  })),
];

const FIRST_TRIGGER: Record<
  Exclude<TriggerVisibility, "always">,
  MenuTriggerId
> = {
  compact: MORE_MENUS,
  wide: MENUS[0].id,
};

export function isTabStop(
  id: MenuTriggerId,
  focusedId: MenuTriggerId | null,
): boolean {
  const focused = MENU_TRIGGERS.find((trigger) => trigger.id === focusedId);
  if (!focused) {
    return Object.values(FIRST_TRIGGER).includes(id);
  }
  if (id === focused.id) {
    return true;
  }
  if (focused.visibility === "compact") {
    return id === FIRST_TRIGGER.wide;
  }
  if (focused.visibility === "wide") {
    return id === FIRST_TRIGGER.compact;
  }
  return false;
}

export function isMenuItem(entry: MenuEntry): entry is MenuItem {
  return entry !== SEPARATOR;
}

export function wrapIndex(index: number, length: number): number {
  return (index + length) % length;
}
