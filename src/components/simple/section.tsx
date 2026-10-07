import type { ReactNode } from "react";
import { getTexts } from "@/content";
import type { Locale } from "@/content/locales";
import type { SectionId } from "@/content/types";
import styles from "./simple.module.css";

export function sectionAnchor(id: SectionId, locale: Locale): string {
  return `${id}-${locale}`;
}

interface SectionProps {
  id: SectionId;
  locale: Locale;
  children: ReactNode;
}

export function Section({ id, locale, children }: Readonly<SectionProps>) {
  const headingId = sectionAnchor(id, locale);
  return (
    <section aria-labelledby={headingId} className={styles.section}>
      <h2 id={headingId}>{getTexts(locale).simpleVersion.sections[id]}</h2>
      {children}
    </section>
  );
}
