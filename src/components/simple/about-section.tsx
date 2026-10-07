import { getTable } from "@/content";
import type { Locale } from "@/content/locales";
import { Section } from "./section";

export function AboutSection({ locale }: Readonly<{ locale: Locale }>) {
  const [profile] = getTable("about", locale);
  const paragraphs = profile.summary.split(/\n\s*\n/);

  return (
    <Section id="about" locale={locale}>
      {paragraphs.map((paragraph) => (
        <p key={paragraph}>{paragraph}</p>
      ))}
    </Section>
  );
}
