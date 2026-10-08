import type { ReactNode } from "react";
import { DocumentPanel } from "@/components/editor/document-panel";
import { DocumentTabs } from "@/components/editor/document-tabs";
import { EditorBar } from "@/components/editor/editor-bar";
import { localize } from "@/content";
import { ConnectionBar } from "./connection-bar";
import styles from "./workspace.module.css";

export function Workspace({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <main className={styles.document}>
      <DocumentTabs label={localize((texts) => texts.shell.editor.tabsLabel)} />
      <DocumentPanel>
        {children}
        <EditorBar />
        <ConnectionBar rowCount={0} />
      </DocumentPanel>
    </main>
  );
}
