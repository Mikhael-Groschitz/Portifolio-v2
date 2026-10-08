import { DocumentTabs } from "@/components/editor/document-tabs";
import { EditorBar } from "@/components/editor/editor-bar";
import { EditorPlaceholder } from "@/components/editor/editor-placeholder";
import { LocaleBlocks } from "@/components/locale/locale-blocks";
import { MessagesPane } from "@/components/results/messages-pane";
import {
  type GridColumn,
  ResultsGrid,
} from "@/components/results/results-grid";
import { ResultsPanel } from "@/components/results/results-panel";
import { getTable, getTexts, localize } from "@/content";
import { formatCount } from "@/content/format";
import { mapLocalized } from "@/content/locales";
import type { AboutRow } from "@/content/types";
import { catalogObject, qualifiedName } from "@/engine/catalog";
import { ConnectionBar } from "./connection-bar";
import styles from "./workspace.module.css";

const ABOUT = catalogObject("about");

const ABOUT_COLUMNS: readonly GridColumn<keyof AboutRow>[] = [
  { key: "name", header: "Name" },
  { key: "role", header: "Role" },
  { key: "summary", header: "Summary", wrap: true },
];

const TAB_ID = "document-tab-about";
const PANEL_ID = "document-panel-about";

export function Workspace() {
  const results = localize((texts) => texts.shell.results);

  return (
    <main className={styles.document}>
      <DocumentTabs
        label={localize((texts) => texts.shell.editor.tabsLabel)}
        title={`${ABOUT.name}.sql`}
        tabId={TAB_ID}
        panelId={PANEL_ID}
      />
      <div
        id={PANEL_ID}
        role="tabpanel"
        aria-labelledby={TAB_ID}
        className={styles.panel}
      >
        <EditorPlaceholder />
        <EditorBar />
        <ResultsPanel
          labels={{
            results: mapLocalized(results, (text) => text.results),
            messages: mapLocalized(results, (text) => text.messages),
          }}
          results={
            <LocaleBlocks>
              {(locale) => (
                <ResultsGrid
                  caption={qualifiedName(ABOUT)}
                  rowNumberLabel={getTexts(locale).shell.results.rowNumber}
                  columns={ABOUT_COLUMNS}
                  rows={getTable("about", locale)}
                />
              )}
            </LocaleBlocks>
          }
          messages={
            <LocaleBlocks>
              {(locale) => (
                <MessagesPane
                  lines={[
                    formatCount(
                      getTexts(locale).shell.results.rowsAffected,
                      getTable("about", locale).length,
                    ),
                  ]}
                />
              )}
            </LocaleBlocks>
          }
        />
        <ConnectionBar rowCount={getTable("about").length} />
      </div>
    </main>
  );
}
