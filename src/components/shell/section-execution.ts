import { getTexts } from "@/content";
import { type Localized, byLocale } from "@/content/locales";
import type { SectionId } from "@/content/types";
import { catalogObject } from "@/engine/catalog";
import { type ExecutionOutcome, execute } from "@/engine/execute";
import { sectionScript } from "@/engine/scripts";

export function executeQuery(
  input: string,
  seed: number,
): Localized<ExecutionOutcome> {
  return byLocale((locale) => execute(input, { locale, random: () => seed }));
}

export function executeSection(
  section: SectionId,
): Localized<ExecutionOutcome> {
  const object = catalogObject(section);
  return byLocale((locale) =>
    execute(sectionScript(object, getTexts(locale).shell.scripts[section]), {
      locale,
    }),
  );
}
