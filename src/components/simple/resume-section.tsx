import { getTable, getTexts } from "@/content";
import type { Locale } from "@/content/locales";
import { ContentLink } from "./content-link";
import { Section } from "./section";

export function ResumeSection({ locale }: Readonly<{ locale: Locale }>) {
  const text = getTexts(locale).simpleVersion;
  const [file] = getTable("resume", locale);

  return (
    <Section id="resume" locale={locale}>
      <p>
        <ContentLink
          url={file.url}
          download={file.fileName}
          newTabLabel={text.opensInNewTab}
        >
          {text.downloadResume}
        </ContentLink>
      </p>
    </Section>
  );
}
