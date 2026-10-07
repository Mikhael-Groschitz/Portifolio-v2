import Link from "next/link";
import { getTexts } from "@/content";
import type { Locale } from "@/content/locales";
import { SECTION_IDS } from "@/content/types";
import { AboutSection } from "./about-section";
import { CareerSection } from "./career-section";
import { ContactSection } from "./contact-section";
import { ProjectsSection } from "./projects-section";
import { ResumeSection } from "./resume-section";
import { sectionAnchor } from "./section";
import { TechStackSection } from "./tech-stack-section";
import styles from "./simple.module.css";

export function SimpleContent({ locale }: Readonly<{ locale: Locale }>) {
  const { about, simpleVersion: text } = getTexts(locale);

  return (
    <>
      <header className={styles.header}>
        <h1 className={styles.name}>{about.name}</h1>
        <p className={styles.role}>{about.role}</p>
        <p>{text.intro}</p>
        <nav aria-label={text.sectionsLabel}>
          <ul className={styles.nav}>
            {SECTION_IDS.map((id) => (
              <li key={id}>
                <a href={`#${sectionAnchor(id, locale)}`}>
                  {text.sections[id]}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </header>
      <AboutSection locale={locale} />
      <TechStackSection locale={locale} />
      <CareerSection locale={locale} />
      <ProjectsSection locale={locale} />
      <ContactSection locale={locale} />
      <ResumeSection locale={locale} />
      <footer className={styles.footer}>
        <Link href="/">{text.fullVersion}</Link>
      </footer>
    </>
  );
}
