"use client";

import { NewQueryIcon } from "@/components/icons";
import { LocaleText } from "@/components/locale/locale-text";
import type { Localized } from "@/content/locales";
import { NEW_QUERY_SHORTCUT } from "./menu-model";
import { useWorkspace } from "./workspace-context";
import styles from "./toolbar.module.css";

export function NewQueryButton({ label }: Readonly<{ label: Localized }>) {
  const { openQuery } = useWorkspace();

  return (
    <button
      type="button"
      className={styles.button}
      aria-keyshortcuts={NEW_QUERY_SHORTCUT}
      onClick={openQuery}
    >
      <NewQueryIcon />
      <span className={styles.label}>
        <LocaleText text={label} />
      </span>
    </button>
  );
}
