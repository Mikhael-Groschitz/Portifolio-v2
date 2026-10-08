import { LOCALES, type Localized } from "@/content/locales";

export function LocaleText({ text }: Readonly<{ text: Localized }>) {
  return LOCALES.map((locale) => (
    <span key={locale} lang={locale} data-locale-block={locale}>
      {text[locale]}
    </span>
  ));
}
