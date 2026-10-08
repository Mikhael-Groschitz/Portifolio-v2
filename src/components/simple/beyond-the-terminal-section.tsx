import { getTable } from "@/content";
import type { Locale } from "@/content/locales";
import { Section } from "./section";
import styles from "./simple.module.css";

export function BeyondTheTerminalSection({
  locale,
}: Readonly<{ locale: Locale }>) {
  return (
    <Section id="beyond-the-terminal" locale={locale}>
      <ul className={styles.list}>
        {getTable("beyond-the-terminal", locale).map((row) => (
          <li key={row.trait} className={styles.item}>
            <h3>{row.trait}</h3>
            <p>{row.description}</p>
          </li>
        ))}
      </ul>
    </Section>
  );
}
