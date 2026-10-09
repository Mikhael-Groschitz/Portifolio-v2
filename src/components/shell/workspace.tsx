import type { ReactNode } from "react";
import { DocumentPanel } from "@/components/editor/document-panel";
import { DocumentTabs } from "@/components/editor/document-tabs";
import { EditorBar } from "@/components/editor/editor-bar";
import { ResultsPanel } from "@/components/results/results-panel";
import { localize } from "@/content";
import { mapLocalized } from "@/content/locales";
import type { Texts } from "@/content/types";
import { ConnectionBar } from "./connection-bar";
import { PageHeading } from "./page-heading";
import {
  type DocumentId,
  HOME_SECTION,
  byDocument,
  isQueryDocument,
} from "./section-routes";
import styles from "./workspace.module.css";

export const CONTENT_ID = "content";

function documentHeading(document: DocumentId, texts: Texts): string {
  if (document === HOME_SECTION) {
    return `${texts.about.name}, ${texts.about.role}`;
  }
  return isQueryDocument(document)
    ? texts.shell.query.editorLabel
    : texts.simpleVersion.sections[document];
}

export function Workspace({ children }: Readonly<{ children: ReactNode }>) {
  const results = localize((texts) => texts.shell.results);

  return (
    <main id={CONTENT_ID} tabIndex={-1} className={styles.document}>
      <PageHeading
        headings={localize((texts) =>
          byDocument((document) => documentHeading(document, texts)),
        )}
      />
      <DocumentTabs
        label={localize((texts) => texts.shell.editor.tabsLabel)}
        queryName={localize((texts) => texts.shell.query.documentName)}
      />
      <DocumentPanel>
        {children}
        <EditorBar text={localize((texts) => texts.shell.editor)} />
        <ResultsPanel
          labels={{
            heading: mapLocalized(results, (text) => text.heading),
            results: mapLocalized(results, (text) => text.results),
            messages: mapLocalized(results, (text) => text.messages),
          }}
          text={results}
        />
        <ConnectionBar text={localize((texts) => texts.shell.connection)} />
      </DocumentPanel>
    </main>
  );
}
