import type { DocumentId } from "@/components/shell/section-routes";

export const DOCUMENT_PANEL_ID = "document-panel";

export function documentTabId(document: DocumentId): string {
  return `document-tab-${document}`;
}
