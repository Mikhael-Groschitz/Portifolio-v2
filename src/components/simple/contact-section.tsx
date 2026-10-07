import { getTable, getTexts } from "@/content";
import type { Locale } from "@/content/locales";
import { ContentLink } from "./content-link";
import { Section } from "./section";
import styles from "./simple.module.css";

export function ContactSection({ locale }: Readonly<{ locale: Locale }>) {
  const texts = getTexts(locale);

  return (
    <Section id="contact" locale={locale}>
      <p>{texts.contact.intro}</p>
      <ul className={styles.contacts}>
        {getTable("contact", locale).map((item) => (
          <li key={item.channel}>
            <span className={styles.meta}>{item.channel}: </span>
            <ContentLink
              url={item.url}
              newTabLabel={texts.simpleVersion.opensInNewTab}
            >
              {item.value}
            </ContentLink>
          </li>
        ))}
      </ul>
    </Section>
  );
}
