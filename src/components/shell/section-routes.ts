import { type SectionId, isSectionId } from "@/content/types";

export const HOME_SECTION: SectionId = "about";

export const QUERY_DOCUMENT = "query";

export type DocumentId = SectionId | typeof QUERY_DOCUMENT;

export function isDocumentId(value: unknown): value is DocumentId {
  return value === QUERY_DOCUMENT || isSectionId(value);
}

export function isQueryDocument(
  document: DocumentId,
): document is typeof QUERY_DOCUMENT {
  return document === QUERY_DOCUMENT;
}

export function documentPath(document: DocumentId): string {
  return `/${document}`;
}

export function documentFromSegment(segment: string | null): DocumentId {
  if (segment === QUERY_DOCUMENT) {
    return QUERY_DOCUMENT;
  }
  return isSectionId(segment) ? segment : HOME_SECTION;
}
