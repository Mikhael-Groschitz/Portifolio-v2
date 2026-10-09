"use client";

import { EXECUTE_SHORTCUTS } from "@/components/editor/execute-shortcut";
import { ExecuteIcon } from "@/components/icons";
import { LocaleText } from "@/components/locale/locale-text";
import type { Localized } from "@/content/locales";
import { useWorkspace } from "./workspace-context";
import styles from "./toolbar.module.css";

export function ExecuteButton({ label }: Readonly<{ label: Localized }>) {
  const { activeDocument, runDocument } = useWorkspace();

  return (
    <button
      type="button"
      className={`${styles.button} ${styles.execute}`}
      aria-keyshortcuts={EXECUTE_SHORTCUTS}
      onClick={() => runDocument(activeDocument)}
    >
      <ExecuteIcon />
      <span className={styles.label}>
        <LocaleText text={label} />
      </span>
    </button>
  );
}
