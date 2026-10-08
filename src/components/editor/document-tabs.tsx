"use client";

import {
  type FocusEvent,
  type KeyboardEvent,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";
import { CaretDownIcon, CloseIcon, PinIcon } from "@/components/icons";
import { LocaleText } from "@/components/locale/locale-text";
import { useWorkspace } from "@/components/shell/workspace-context";
import { neighborAfterClose } from "@/components/shell/workspace-state";
import type { Localized } from "@/content/locales";
import { type SectionId, isSectionId } from "@/content/types";
import { catalogObject } from "@/engine/catalog";
import { DOCUMENT_PANEL_ID, documentTabId } from "./document-ids";
import styles from "./editor.module.css";

export function DocumentTabs({ label }: Readonly<{ label: Localized }>) {
  const { tabs, activeSection, activateSection, closeSection } = useWorkspace();
  const [focusedId, setFocusedId] = useState<SectionId | null>(null);
  const tabRefs = useRef(new Map<SectionId, HTMLButtonElement>());
  const labelId = useId();
  const closable = tabs.length > 1;
  const tabStop =
    focusedId !== null && tabs.includes(focusedId) ? focusedId : activeSection;

  useEffect(() => {
    tabRefs.current
      .get(activeSection)
      ?.scrollIntoView({ block: "nearest", inline: "nearest" });
  }, [activeSection]);

  function focusTab(section: SectionId | undefined) {
    if (section) {
      tabRefs.current.get(section)?.focus();
    }
  }

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    const index = tabs.indexOf(tabStop);
    switch (event.key) {
      case "ArrowRight":
        focusTab(tabs[(index + 1) % tabs.length]);
        break;
      case "ArrowLeft":
        focusTab(tabs[(index - 1 + tabs.length) % tabs.length]);
        break;
      case "Home":
        focusTab(tabs[0]);
        break;
      case "End":
        focusTab(tabs.at(-1));
        break;
      case "Delete":
        if (!closable) {
          return;
        }
        focusTab(neighborAfterClose(tabs, tabStop));
        closeSection(tabStop);
        break;
      default:
        return;
    }
    event.preventDefault();
  }

  function handleFocus(event: FocusEvent<HTMLDivElement>) {
    const { section } = (event.target as HTMLElement).dataset;
    if (isSectionId(section)) {
      setFocusedId(section);
    }
  }

  function handleBlur(event: FocusEvent<HTMLDivElement>) {
    if (!event.currentTarget.contains(event.relatedTarget)) {
      setFocusedId(null);
    }
  }

  return (
    <div className={styles.tabStrip}>
      <span id={labelId} className="visually-hidden">
        <LocaleText text={label} />
      </span>
      <div
        role="tablist"
        aria-labelledby={labelId}
        className={styles.tabs}
        onKeyDown={handleKeyDown}
        onFocus={handleFocus}
        onBlur={handleBlur}
      >
        {tabs.map((section) => {
          const selected = section === activeSection;
          return (
            <div
              key={section}
              role="presentation"
              className={
                selected ? `${styles.tab} ${styles.activeTab}` : styles.tab
              }
            >
              <button
                ref={(element) => {
                  if (element) {
                    tabRefs.current.set(section, element);
                  }
                  return () => {
                    tabRefs.current.delete(section);
                  };
                }}
                id={documentTabId(section)}
                type="button"
                role="tab"
                aria-selected={selected}
                aria-controls={selected ? DOCUMENT_PANEL_ID : undefined}
                aria-keyshortcuts={closable ? "Delete" : undefined}
                tabIndex={section === tabStop ? 0 : -1}
                data-section={section}
                className={styles.tabButton}
                onClick={() => activateSection(section)}
              >
                {catalogObject(section).name}.sql
              </button>
              <span className={styles.tabIcons} aria-hidden="true">
                {selected && <PinIcon size={14} />}
                {closable && (
                  <span
                    className={styles.closeTab}
                    onClick={() => closeSection(section)}
                  >
                    <CloseIcon size={14} />
                  </span>
                )}
              </span>
            </div>
          );
        })}
      </div>
      <span className={styles.stripIcons} aria-hidden="true">
        <CaretDownIcon />
      </span>
    </div>
  );
}
