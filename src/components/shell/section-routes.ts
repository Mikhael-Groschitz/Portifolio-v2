import { SECTION_IDS, type SectionId, isSectionId } from "@/content/types";

export const HOME_SECTION = "about" satisfies SectionId;

export const QUERY_DOCUMENT = "query";

export type DocumentId = SectionId | typeof QUERY_DOCUMENT;

export const DOCUMENT_IDS: readonly DocumentId[] = [
  ...SECTION_IDS,
  QUERY_DOCUMENT,
];

export function byDocument<T>(
  pick: (document: DocumentId) => T,
): Record<DocumentId, T> {
  return Object.fromEntries(
    DOCUMENT_IDS.map((document) => [document, pick(document)]),
  ) as Record<DocumentId, T>;
}

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
