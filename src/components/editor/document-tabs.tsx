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
import {
  type DocumentId,
  isDocumentId,
  isQueryDocument,
} from "@/components/shell/section-routes";
import { useWorkspace } from "@/components/shell/workspace-context";
import { neighborAfterClose } from "@/components/shell/workspace-state";
import type { Localized } from "@/content/locales";
import { catalogObject } from "@/engine/catalog";
import { DOCUMENT_PANEL_ID, documentTabId } from "./document-ids";
import styles from "./editor.module.css";

interface DocumentTabsProps {
  label: Localized;
  queryName: Localized;
}

function TabName({
  document,
  queryName,
}: Readonly<{ document: DocumentId; queryName: Localized }>) {
  if (isQueryDocument(document)) {
    return <LocaleText text={queryName} />;
  }
  return `${catalogObject(document).name}.sql`;
}

export function DocumentTabs({
  label,
  queryName,
}: Readonly<DocumentTabsProps>) {
  const { tabs, activeDocument, activateDocument, closeDocument } =
    useWorkspace();
  const [focusedId, setFocusedId] = useState<DocumentId | null>(null);
  const tabRefs = useRef(new Map<DocumentId, HTMLButtonElement>());
  const labelId = useId();
  const closable = tabs.length > 1;
  const tabStop =
    focusedId !== null && tabs.includes(focusedId) ? focusedId : activeDocument;

  useEffect(() => {
    tabRefs.current
      .get(activeDocument)
      ?.scrollIntoView({ block: "nearest", inline: "nearest" });
  }, [activeDocument]);

  function focusTab(document: DocumentId | undefined) {
    if (document) {
      tabRefs.current.get(document)?.focus();
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
        closeDocument(tabStop);
        break;
      default:
        return;
    }
    event.preventDefault();
  }

  function handleFocus(event: FocusEvent<HTMLDivElement>) {
    const { document } = (event.target as HTMLElement).dataset;
    if (isDocumentId(document)) {
      setFocusedId(document);
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
        {tabs.map((document) => {
          const selected = document === activeDocument;
          return (
            <div
              key={document}
              role="presentation"
              className={
                selected ? `${styles.tab} ${styles.activeTab}` : styles.tab
              }
            >
              <button
                ref={(element) => {
                  if (element) {
                    tabRefs.current.set(document, element);
                  }
                  return () => {
                    tabRefs.current.delete(document);
                  };
                }}
                id={documentTabId(document)}
                type="button"
                role="tab"
                aria-selected={selected}
                aria-controls={selected ? DOCUMENT_PANEL_ID : undefined}
                aria-keyshortcuts={closable ? "Delete" : undefined}
                tabIndex={document === tabStop ? 0 : -1}
                data-document={document}
                className={styles.tabButton}
                onClick={() => activateDocument(document)}
              >
                <TabName document={document} queryName={queryName} />
              </button>
              <span className={styles.tabIcons} aria-hidden="true">
                {selected && <PinIcon size={14} />}
                {closable && (
                  <span
                    className={styles.closeTab}
                    onClick={() => closeDocument(document)}
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
