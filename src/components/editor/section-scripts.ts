import { getTexts } from "@/content";
import { LOCALES, type Locale } from "@/content/locales";
import type { SectionId } from "@/content/types";
import { CATALOG, catalogIdentifiers } from "@/engine/catalog";
import { sectionScript } from "@/engine/scripts";
import { type CodeToken, highlightTsql } from "./highlight";

const identifiers = catalogIdentifiers();

function scriptKey(section: SectionId, locale: Locale): string {
  return `${section}:${locale}`;
}

const highlighted = new Map(
  CATALOG.flatMap((object) =>
    LOCALES.map((locale) => {
      const script = sectionScript(
        object,
        getTexts(locale).shell.scripts[object.section],
      );
      return [
        scriptKey(object.section, locale),
        highlightTsql(script, identifiers),
      ] as const;
    }),
  ),
);

export function scriptLines(
  section: SectionId,
  locale: Locale,
): readonly CodeToken[][] {
  return highlighted.get(scriptKey(section, locale)) ?? [];
}
