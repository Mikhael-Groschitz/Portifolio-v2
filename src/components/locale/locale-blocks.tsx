import type { ReactNode } from "react";
import { LOCALES, type Locale } from "@/content/locales";

export function LocaleBlocks({
  children,
}: Readonly<{ children: (locale: Locale) => ReactNode }>) {
  return LOCALES.map((locale) => (
    <div key={locale} lang={locale} data-locale-block={locale}>
      {children(locale)}
    </div>
  ));
}
