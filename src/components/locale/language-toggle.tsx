"use client";

import { LOCALES, type Localized } from "@/content/locales";
import { useLanguage } from "./language-context";
import { nextLocale } from "./locale-runtime";
import styles from "./language-toggle.module.css";

export function LanguageToggle({ labels }: { labels: Localized }) {
  const { locale, setLocale } = useLanguage();

  return (
    <button
      type="button"
      className={styles.toggle}
      onClick={() => setLocale(nextLocale(locale))}
    >
      {LOCALES.map((option) => (
        <span key={option} lang={nextLocale(option)} data-locale-block={option}>
          {labels[option]}
        </span>
      ))}
    </button>
  );
}
