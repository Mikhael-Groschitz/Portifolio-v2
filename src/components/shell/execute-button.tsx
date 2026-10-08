"use client";

import { ExecuteIcon } from "@/components/icons";
import { LocaleText } from "@/components/locale/locale-text";
import type { Localized } from "@/content/locales";
import { useWorkspace } from "./workspace-context";
import styles from "./toolbar.module.css";

export function ExecuteButton({ label }: Readonly<{ label: Localized }>) {
  const { activeSection, runSection } = useWorkspace();

  return (
    <button
      type="button"
      className={`${styles.button} ${styles.execute}`}
      onClick={() => runSection(activeSection)}
    >
      <ExecuteIcon />
      <span className={styles.label}>
        <LocaleText text={label} />
      </span>
    </button>
  );
}
