"use client";

import { type KeyboardEvent, type MouseEvent, useId } from "react";
import {
  CaretDownIcon,
  CloseIcon,
  NewQueryIcon,
  PinIcon,
  ProcedureIcon,
  TableIcon,
} from "@/components/icons";
import { LocaleText } from "@/components/locale/locale-text";
import { documentPath } from "@/components/shell/section-routes";
import { useWorkspace } from "@/components/shell/workspace-context";
import {
  DEFAULT_LOCALE,
  type Localized,
  mapLocalized,
} from "@/content/locales";
import type { CheatsheetText, SectionId } from "@/content/types";
import { CATALOG } from "@/engine/catalog";
import { commandFor } from "@/engine/hints";
import { CHEATSHEET_ID, useGuide } from "./guide-context";
import styles from "./cheatsheet.module.css";

function isPlainClick(event: MouseEvent): boolean {
  return (
    event.button === 0 &&
    !event.ctrlKey &&
    !event.metaKey &&
    !event.shiftKey &&
    !event.altKey
  );
}

export function CheatsheetPanel({
  text,
}: Readonly<{ text: Localized<CheatsheetText> }>) {
  const { openSection, openQuery, query } = useWorkspace();
  const { docked, sheetOpen, openCheatsheet, closeCheatsheet, tableOpened } =
    useGuide();
  const titleId = useId();
  const sheet = !docked;

  function label(pick: (entry: CheatsheetText) => string) {
    return <LocaleText text={mapLocalized(text, pick)} />;
  }

  function openFromList(event: MouseEvent, section: SectionId) {
    if (!isPlainClick(event)) {
      return;
    }
    event.preventDefault();
    openSection(section);
    tableOpened();
    if (sheet) {
      closeCheatsheet();
    }
  }

  function insertExample(command: string) {
    const current = query.getSnapshot().text.trimEnd();
    const next = current ? `${current}\n${command}` : command;
    query.update({
      text: next,
      selectionStart: next.length,
      selectionEnd: next.length,
    });
    if (sheet) {
      closeCheatsheet();
    }
    openQuery();
  }

  function handleKeyDown(event: KeyboardEvent<HTMLElement>) {
    if (sheetOpen && event.key === "Escape") {
      event.preventDefault();
      closeCheatsheet();
    }
  }

  return (
    <>
      <button
        type="button"
        className={styles.edgeTab}
        data-cheatsheet-tab=""
        aria-controls={CHEATSHEET_ID}
        aria-expanded={false}
        onClick={openCheatsheet}
      >
        <span className={styles.edgeLabel}>
          {label((entry) => entry.title)}
        </span>
      </button>
      <aside
        id={CHEATSHEET_ID}
        role={sheet ? "dialog" : undefined}
        aria-modal={sheet || undefined}
        aria-labelledby={titleId}
        className={styles.panel}
        data-sheet-open={sheetOpen}
        onKeyDown={handleKeyDown}
      >
        <div className={styles.header}>
          <h2 id={titleId} className={styles.title}>
            {label((entry) => entry.title)}
          </h2>
          <span className={styles.grip} aria-hidden="true" />
          <span className={styles.headerIcons} aria-hidden="true">
            <CaretDownIcon />
            <PinIcon />
          </span>
          <button
            type="button"
            className={styles.close}
            onClick={closeCheatsheet}
          >
            <CloseIcon />
            <span className="visually-hidden">
              {label((entry) => entry.close)}
            </span>
          </button>
        </div>
        <div className={styles.body}>
          <p className={styles.intro}>{label((entry) => entry.intro)}</p>
          <h3 className={styles.heading}>
            {label((entry) => entry.sectionsTitle)}
          </h3>
          <ul className={styles.list}>
            {CATALOG.map((object) => (
              <li key={object.section}>
                <a
                  href={documentPath(object.section)}
                  className={styles.item}
                  data-cheatsheet-item=""
                  onClick={(event) => openFromList(event, object.section)}
                >
                  <span className={styles.itemIcon}>
                    {object.kind === "table" ? (
                      <TableIcon />
                    ) : (
                      <ProcedureIcon />
                    )}
                  </span>
                  <span className={styles.itemText}>
                    {label((entry) => entry.sections[object.section])}
                    <code className={styles.itemCode}>
                      {commandFor(object)}
                    </code>
                  </span>
                </a>
              </li>
            ))}
          </ul>
          <h3 className={styles.heading}>
            {label((entry) => entry.exploreTitle)}
          </h3>
          <p className={styles.intro}>{label((entry) => entry.exploreIntro)}</p>
          <ul className={styles.list}>
            {text[DEFAULT_LOCALE].examples.map(({ command }, index) => (
              <li key={command}>
                <button
                  type="button"
                  className={styles.item}
                  onClick={() => insertExample(command)}
                >
                  <span className={styles.itemIcon}>
                    <NewQueryIcon />
                  </span>
                  <span className={styles.itemText}>
                    <code className={styles.itemCode}>{command}</code>
                    {label((entry) => entry.examples[index].description)}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      </aside>
    </>
  );
}
