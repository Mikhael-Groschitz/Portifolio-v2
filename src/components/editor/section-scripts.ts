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
  await Promise.all(
    CATALOG.flatMap((object) =>
      LOCALES.map(async (locale) => {
        const script = sectionScript(
          object,
          getTexts(locale).shell.scripts[object.section],
        );
        const lines = await highlightTsql(script, identifiers);
        return [scriptKey(object.section, locale), lines] as const;
      }),
    ),
  ),
);

export function scriptLines(
  section: SectionId,
  locale: Locale,
): readonly CodeToken[][] {
  return highlighted.get(scriptKey(section, locale)) ?? [];
}
