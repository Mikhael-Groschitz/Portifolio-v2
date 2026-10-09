"use client";

import { TardisIcon } from "@/components/icons";
import { LocaleText } from "@/components/locale/locale-text";
import type { Localized } from "@/content/locales";
import { useEasterEggs } from "./easter-egg-context";
import styles from "./easter-eggs.module.css";

export function TimeTravelOverlay({ text }: Readonly<{ text: Localized }>) {
  const { traveling } = useEasterEggs();
  if (!traveling) {
    return null;
  }
  return (
    <div className={styles.overlay} data-time-travel="" aria-hidden="true">
      <div className={styles.cabin}>
        <TardisIcon size={176} />
      </div>
      <p className={styles.caption}>
        <LocaleText text={text} />
      </p>
    </div>
  );
}
