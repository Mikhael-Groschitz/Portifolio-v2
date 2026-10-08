"use client";

import { CloseIcon } from "@/components/icons";
import { LocaleText } from "@/components/locale/locale-text";
import { useShell } from "@/components/shell/shell-frame";
import type { Localized } from "@/content/locales";
import styles from "./object-explorer.module.css";

export function ExplorerCloseButton({ label }: Readonly<{ label: Localized }>) {
  const { closeExplorer } = useShell();

  return (
    <button
      type="button"
      className={styles.closeButton}
      onClick={closeExplorer}
    >
      <CloseIcon />
      <span className="visually-hidden">
        <LocaleText text={label} />
      </span>
    </button>
  );
}
