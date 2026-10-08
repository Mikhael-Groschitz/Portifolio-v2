"use client";

import type { KeyboardEvent, ReactNode } from "react";
import { useWorkspace } from "@/components/shell/workspace-context";
import { DOCUMENT_PANEL_ID, documentTabId } from "./document-ids";
import styles from "./editor.module.css";

function isPlainF5(event: KeyboardEvent): boolean {
  return (
    event.key === "F5" &&
    !event.ctrlKey &&
    !event.altKey &&
    !event.metaKey &&
    !event.shiftKey
  );
}

export function DocumentPanel({ children }: Readonly<{ children: ReactNode }>) {
  const { activeSection, runSection } = useWorkspace();

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    const inEditor = (event.target as HTMLElement).closest("[data-editor]");
    if (isPlainF5(event) && inEditor) {
      event.preventDefault();
      runSection(activeSection);
    }
  }

  return (
    <div
      id={DOCUMENT_PANEL_ID}
      role="tabpanel"
      aria-labelledby={documentTabId(activeSection)}
      className={styles.panel}
      onKeyDown={handleKeyDown}
    >
      {children}
    </div>
  );
}
