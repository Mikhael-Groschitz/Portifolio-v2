import type { SectionId } from "@/content/types";

export const DOCUMENT_PANEL_ID = "document-panel";

export function documentTabId(section: SectionId): string {
  return `document-tab-${section}`;
}
