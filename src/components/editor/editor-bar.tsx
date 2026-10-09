"use client";

import { useSyncExternalStore } from "react";
import { CaretDownIcon, CheckCircleIcon } from "@/components/icons";
import { LocaleText } from "@/components/locale/locale-text";
import { isQueryDocument } from "@/components/shell/section-routes";
import { useWorkspace } from "@/components/shell/workspace-context";
import { type Localized, mapLocalized } from "@/content/locales";
import type { ShellText } from "@/content/types";
import { cursorOf } from "./query-store";
import styles from "./editor.module.css";

const START = { line: 1, column: 1 };

export function EditorBar({
  text,
}: Readonly<{ text: Localized<ShellText["editor"]> }>) {
  const { activeDocument, query } = useWorkspace();
  const snapshot = useSyncExternalStore(
    query.subscribe,
    query.getSnapshot,
    query.getSnapshot,
  );
  const cursor = isQueryDocument(activeDocument)
    ? cursorOf(snapshot.text, snapshot.selectionEnd)
    : START;

  return (
    <div className={styles.editorBar}>
      <span className={styles.zoom} aria-hidden="true">
        100 %
        <CaretDownIcon size={14} />
      </span>
      <span className={styles.issues}>
        <CheckCircleIcon size={14} />
        <LocaleText text={mapLocalized(text, (editor) => editor.noIssues)} />
      </span>
      <span className={styles.position}>
        <span>
          <LocaleText text={mapLocalized(text, (editor) => editor.line)} />
          {`: ${cursor.line}`}
        </span>
        <span>
          <LocaleText text={mapLocalized(text, (editor) => editor.column)} />
          {`: ${cursor.column}`}
        </span>
      </span>
    </div>
  );
}
