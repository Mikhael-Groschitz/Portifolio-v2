"use client";

import Link from "next/link";
import {
  type FocusEvent,
  type KeyboardEvent,
  type ReactNode,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";
import { MenuIcon } from "@/components/icons";
import { useLanguage } from "@/components/locale/language-context";
import { nextLocale } from "@/components/locale/locale-runtime";
import { LocaleText } from "@/components/locale/locale-text";
import { type Localized, mapLocalized } from "@/content/locales";
import type { MenuText } from "@/content/types";
import {
  MENU_TRIGGERS,
  MORE_MENUS,
  type MenuCommand,
  type MenuEntry,
  type MenuItem,
  type MenuTrigger,
  type MenuTriggerId,
  isMenuItem,
  isTabStop,
  wrapIndex,
} from "./menu-model";
import { useShell } from "./shell-frame";
import styles from "./menu-bar.module.css";

type ItemFocus = "first" | "last";

interface MenuBarProps {
  text: Localized<MenuText>;
  languageNames: Localized;
}

const VISIBILITY_CLASS: Record<MenuTrigger["visibility"], string> = {
  compact: styles.compactOnly,
  wide: styles.wideOnly,
  always: "",
};

function menuItemsIn(container: HTMLElement | null): HTMLElement[] {
  return Array.from(
    container?.querySelectorAll<HTMLElement>('[role="menuitem"]') ?? [],
  );
}

function focusItem(container: HTMLElement | null, itemFocus: ItemFocus) {
  const items = menuItemsIn(container);
  (itemFocus === "first" ? items[0] : items.at(-1))?.focus();
}

export function MenuBar({ text, languageNames }: Readonly<MenuBarProps>) {
  const { locale, setLocale } = useLanguage();
  const { showExplorer } = useShell();
  const baseId = useId();
  const [openId, setOpenId] = useState<MenuTriggerId | null>(null);
  const [focusedId, setFocusedId] = useState<MenuTriggerId | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const popupRef = useRef<HTMLDivElement>(null);
  const triggerRefs = useRef(new Map<MenuTriggerId, HTMLButtonElement>());
  const itemFocusRef = useRef<ItemFocus>("first");

  useEffect(() => {
    if (openId !== null) {
      focusItem(popupRef.current, itemFocusRef.current);
    }
  }, [openId]);

  useEffect(() => {
    if (openId === null) {
      return;
    }
    function closeOnOutsidePointer(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpenId(null);
      }
    }
    document.addEventListener("pointerdown", closeOnOutsidePointer);
    return () =>
      document.removeEventListener("pointerdown", closeOnOutsidePointer);
  }, [openId]);

  function openMenu(id: MenuTriggerId, itemFocus: ItemFocus = "first") {
    if (openId === id) {
      focusItem(popupRef.current, itemFocus);
      return;
    }
    itemFocusRef.current = itemFocus;
    setOpenId(id);
  }

  function focusTrigger(id: MenuTriggerId) {
    triggerRefs.current.get(id)?.focus();
  }

  function moveTrigger(fromId: MenuTriggerId, step: number | ItemFocus) {
    const visible = MENU_TRIGGERS.filter(
      (trigger) =>
        (triggerRefs.current.get(trigger.id)?.getClientRects().length ?? 0) > 0,
    );
    const index = visible.findIndex((trigger) => trigger.id === fromId);
    let target: MenuTrigger | undefined;
    if (step === "first") {
      target = visible[0];
    } else if (step === "last") {
      target = visible.at(-1);
    } else {
      target = visible[wrapIndex(index + step, visible.length)];
    }
    if (!target) {
      return;
    }
    focusTrigger(target.id);
    if (openId !== null) {
      openMenu(target.id);
    }
  }

  function runCommand(command: MenuCommand) {
    if (command === "showExplorer") {
      showExplorer();
    } else {
      setLocale(nextLocale(locale));
    }
  }

  function activate(item: MenuItem, trigger: MenuTrigger) {
    if (!item.action) {
      return;
    }
    if (item.action.kind === "command") {
      runCommand(item.action.command);
    }
    const focusStayed =
      popupRef.current?.contains(document.activeElement) ?? false;
    setOpenId(null);
    if (focusStayed) {
      focusTrigger(trigger.id);
    }
  }

  function handleTriggerKeyDown(
    event: KeyboardEvent<HTMLButtonElement>,
    trigger: MenuTrigger,
  ) {
    switch (event.key) {
      case "ArrowRight":
        moveTrigger(trigger.id, 1);
        break;
      case "ArrowLeft":
        moveTrigger(trigger.id, -1);
        break;
      case "Home":
        moveTrigger(trigger.id, "first");
        break;
      case "End":
        moveTrigger(trigger.id, "last");
        break;
      case "ArrowDown":
        openMenu(trigger.id, "first");
        break;
      case "ArrowUp":
        openMenu(trigger.id, "last");
        break;
      case "Escape":
        if (openId === null) {
          return;
        }
        setOpenId(null);
        break;
      default:
        return;
    }
    event.preventDefault();
  }

  function handlePopupKeyDown(
    event: KeyboardEvent<HTMLDivElement>,
    trigger: MenuTrigger,
  ) {
    const items = menuItemsIn(popupRef.current);
    const index = items.findIndex((item) => item === document.activeElement);
    switch (event.key) {
      case "ArrowDown":
        items[wrapIndex(index + 1, items.length)]?.focus();
        break;
      case "ArrowUp":
        items[wrapIndex(index - 1, items.length)]?.focus();
        break;
      case "Home":
        items[0]?.focus();
        break;
      case "End":
        items.at(-1)?.focus();
        break;
      case "ArrowRight":
        moveTrigger(trigger.id, 1);
        break;
      case "ArrowLeft":
        moveTrigger(trigger.id, -1);
        break;
      case "Escape":
        setOpenId(null);
        focusTrigger(trigger.id);
        break;
      case "Tab":
        setOpenId(null);
        return;
      case " ":
        if (!(document.activeElement instanceof HTMLAnchorElement)) {
          return;
        }
        document.activeElement.click();
        break;
      default:
        return;
    }
    event.preventDefault();
  }

  function handleBlur(event: FocusEvent<HTMLDivElement>) {
    if (
      event.relatedTarget &&
      !rootRef.current?.contains(event.relatedTarget)
    ) {
      setOpenId(null);
    }
  }

  function renderItem(item: MenuItem, trigger: MenuTrigger) {
    const label = text[locale].items[item.id];
    const target = nextLocale(locale);
    const content: ReactNode =
      item.action?.kind === "command" &&
      item.action.command === "switchLanguage" ? (
        <span>
          {label}: <span lang={target}>{languageNames[target]}</span>
        </span>
      ) : (
        <span>{label}</span>
      );
    const shortcut = item.shortcut && (
      <span className={styles.shortcut}>{item.shortcut}</span>
    );

    if (item.action?.kind === "link") {
      return (
        <Link
          key={item.id}
          href={item.action.href}
          role="menuitem"
          tabIndex={-1}
          className={styles.item}
          onClick={() => activate(item, trigger)}
        >
          {content}
          {shortcut}
        </Link>
      );
    }

    return (
      <button
        key={item.id}
        type="button"
        role="menuitem"
        tabIndex={-1}
        aria-disabled={item.action ? undefined : true}
        className={styles.item}
        onClick={() => activate(item, trigger)}
      >
        {content}
        {shortcut}
      </button>
    );
  }

  function renderEntries(entries: readonly MenuEntry[], trigger: MenuTrigger) {
    return entries.map((entry, index) =>
      isMenuItem(entry) ? (
        renderItem(entry, trigger)
      ) : (
        <hr key={`separator-${index}`} className={styles.separator} />
      ),
    );
  }

  function renderPopup(
    trigger: MenuTrigger,
    popupId: string,
    triggerId: string,
  ) {
    const [onlyMenu] = trigger.menus;
    return (
      <div
        ref={popupRef}
        id={popupId}
        role="menu"
        tabIndex={-1}
        aria-labelledby={triggerId}
        className={styles.popup}
        onKeyDown={(event) => handlePopupKeyDown(event, trigger)}
      >
        {trigger.menus.length === 1
          ? renderEntries(onlyMenu.entries, trigger)
          : trigger.menus.map((menu) => (
              <div
                key={menu.id}
                role="group"
                aria-label={text[locale].menus[menu.id]}
                className={styles.group}
              >
                <div aria-hidden="true" className={styles.groupLabel}>
                  {text[locale].menus[menu.id]}
                </div>
                {renderEntries(menu.entries, trigger)}
              </div>
            ))}
      </div>
    );
  }

  function triggerLabel({ id }: MenuTrigger): ReactNode {
    if (id === MORE_MENUS) {
      return (
        <>
          <MenuIcon />
          <span className="visually-hidden">
            <LocaleText text={mapLocalized(text, (entry) => entry.more)} />
          </span>
        </>
      );
    }
    return <LocaleText text={mapLocalized(text, (entry) => entry.menus[id])} />;
  }

  const menuBarLabelId = `${baseId}-label`;

  return (
    <>
      <span id={menuBarLabelId} className="visually-hidden">
        <LocaleText text={mapLocalized(text, (entry) => entry.label)} />
      </span>
      <div
        ref={rootRef}
        role="menubar"
        aria-labelledby={menuBarLabelId}
        className={styles.menuBar}
        onBlur={handleBlur}
      >
        {MENU_TRIGGERS.map((trigger) => {
          const triggerId = `${baseId}-${trigger.id}`;
          const popupId = `${triggerId}-menu`;
          const open = openId === trigger.id;
          return (
            <div
              key={trigger.id}
              role="none"
              className={`${styles.entry} ${VISIBILITY_CLASS[trigger.visibility]}`}
            >
              <button
                ref={(element) => {
                  if (element) {
                    triggerRefs.current.set(trigger.id, element);
                  }
                  return () => {
                    triggerRefs.current.delete(trigger.id);
                  };
                }}
                id={triggerId}
                type="button"
                role="menuitem"
                aria-haspopup="menu"
                aria-expanded={open}
                aria-controls={open ? popupId : undefined}
                tabIndex={isTabStop(trigger.id, focusedId) ? 0 : -1}
                className={styles.trigger}
                onClick={() => (open ? setOpenId(null) : openMenu(trigger.id))}
                onKeyDown={(event) => handleTriggerKeyDown(event, trigger)}
                onFocus={() => setFocusedId(trigger.id)}
                onPointerEnter={() => {
                  if (openId !== null && !open) {
                    openMenu(trigger.id);
                  }
                }}
              >
                {triggerLabel(trigger)}
              </button>
              {open && renderPopup(trigger, popupId, triggerId)}
            </div>
          );
        })}
      </div>
    </>
  );
}
