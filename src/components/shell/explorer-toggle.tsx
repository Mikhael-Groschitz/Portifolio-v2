"use client";

import { useGuide } from "@/components/cheatsheet/guide-context";
import { ExplorerIcon } from "@/components/icons";
import { LocaleText } from "@/components/locale/locale-text";
import type { Localized } from "@/content/locales";
import { EXPLORER_ID, useShell } from "./shell-frame";
import styles from "./toolbar.module.css";

export function ExplorerToggle({ label }: Readonly<{ label: Localized }>) {
  const { explorerOpen, openExplorer } = useShell();
  const { pulse } = useGuide();

  return (
    <button
      type="button"
      className={`${styles.button} ${styles.explorerToggle}`}
      aria-expanded={explorerOpen}
      aria-controls={EXPLORER_ID}
      data-tour="explorer-toggle"
      data-highlight={pulse || undefined}
      onClick={openExplorer}
    >
      <ExplorerIcon />
      <span className="visually-hidden">
        <LocaleText text={label} />
      </span>
    </button>
  );
}
