"use client";

import type { ReactNode } from "react";
import { useWorkspace } from "@/components/shell/workspace-context";
import { DOCUMENT_PANEL_ID, documentTabId } from "./document-ids";
import styles from "./editor.module.css";

export function DocumentPanel({ children }: Readonly<{ children: ReactNode }>) {
  const { activeSection } = useWorkspace();

  return (
    <div
      id={DOCUMENT_PANEL_ID}
      role="tabpanel"
      aria-labelledby={documentTabId(activeSection)}
      className={styles.panel}
    >
      {children}
    </div>
  );
}
