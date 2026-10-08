import { type SectionId, isSectionId } from "@/content/types";

export const HOME_SECTION: SectionId = "about";

export function sectionPath(section: SectionId): string {
  return `/${section}`;
}

export function sectionFromSegment(segment: string | null): SectionId {
  return isSectionId(segment) ? segment : HOME_SECTION;
}
