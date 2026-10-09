import type { ReactNode } from "react";
import { DocumentPanel } from "@/components/editor/document-panel";
import { DocumentTabs } from "@/components/editor/document-tabs";
import { EditorBar } from "@/components/editor/editor-bar";
import { ResultsPanel } from "@/components/results/results-panel";
import { localize } from "@/content";
import { mapLocalized } from "@/content/locales";
import { ConnectionBar } from "./connection-bar";
import styles from "./workspace.module.css";

export function Workspace({ children }: Readonly<{ children: ReactNode }>) {
  const results = localize((texts) => texts.shell.results);

  return (
    <main className={styles.document}>
      <DocumentTabs
        label={localize((texts) => texts.shell.editor.tabsLabel)}
        queryName={localize((texts) => texts.shell.query.documentName)}
      />
      <DocumentPanel>
        {children}
        <EditorBar text={localize((texts) => texts.shell.editor)} />
        <ResultsPanel
          labels={{
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
