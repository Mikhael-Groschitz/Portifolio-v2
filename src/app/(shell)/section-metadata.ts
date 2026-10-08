import type { Metadata } from "next";
import { getTexts } from "@/content";
import { DEFAULT_LOCALE } from "@/content/locales";
import type { SectionId } from "@/content/types";

export function sectionMetadata(section: SectionId): Metadata {
  const { about, simpleVersion } = getTexts(DEFAULT_LOCALE);
  return { title: `${simpleVersion.sections[section]} | ${about.name}` };
}
