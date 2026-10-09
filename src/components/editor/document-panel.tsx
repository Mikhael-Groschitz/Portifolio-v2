"use client";

import type { KeyboardEvent, ReactNode } from "react";
import { useWorkspace } from "@/components/shell/workspace-context";
import { DOCUMENT_PANEL_ID, documentTabId } from "./document-ids";
import { isExecuteShortcut } from "./execute-shortcut";
import styles from "./editor.module.css";

export function DocumentPanel({ children }: Readonly<{ children: ReactNode }>) {
  const { activeDocument, runDocument } = useWorkspace();

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    const inEditor = (event.target as HTMLElement).closest("[data-editor]");
    if (isExecuteShortcut(event) && inEditor) {
      event.preventDefault();
      runDocument(activeDocument);
    }
  }

  return (
    <div
      id={DOCUMENT_PANEL_ID}
      role="tabpanel"
      aria-labelledby={documentTabId(activeDocument)}
      className={styles.panel}
      onKeyDown={handleKeyDown}
    >
      {children}
    </div>
  );
}
