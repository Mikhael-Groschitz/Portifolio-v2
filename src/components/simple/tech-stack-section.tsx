import { getTable } from "@/content";
import type { Locale } from "@/content/locales";
import { Section } from "./section";
import styles from "./simple.module.css";

export function TechStackSection({ locale }: Readonly<{ locale: Locale }>) {
  const groups = Map.groupBy(
    getTable("tech-stack", locale),
    (row) => row.category,
  );

  return (
    <Section id="tech-stack" locale={locale}>
      {[...groups].map(([category, rows]) => (
        <div key={category}>
          <h3>{category}</h3>
          <ul className={styles.tags}>
            {rows.map((row) => (
              <li key={row.technology} className={styles.tag}>
                {row.technology}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </Section>
  );
}
