import { getTexts } from "@/content";
import { type Localized, byLocale } from "@/content/locales";
import type { SectionId } from "@/content/types";
import { catalogObject } from "@/engine/catalog";
import { type ExecutionOutcome, execute } from "@/engine/execute";
import { sectionScript } from "@/engine/scripts";

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
