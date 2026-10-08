"use client";

import {
  type KeyboardEvent,
  type ReactNode,
  useId,
  useRef,
  useState,
} from "react";
import { GridIcon, MessagesIcon } from "@/components/icons";
import { LocaleBlocks } from "@/components/locale/locale-blocks";
import { LocaleText } from "@/components/locale/locale-text";
import { useLoadedAt } from "@/components/shell/use-loaded-at";
import { useWorkspace } from "@/components/shell/workspace-context";
import type { Run } from "@/components/shell/workspace-state";
import type { Localized } from "@/content/locales";
import type { ResultsText } from "@/content/types";
import { MessagesPane } from "./messages-pane";
import { ResultsGrid } from "./results-grid";
import styles from "./results.module.css";

const VIEWS = ["results", "messages"] as const;

type ResultsView = (typeof VIEWS)[number];

const VIEW_ICONS: Record<ResultsView, ReactNode> = {
  results: <GridIcon size={14} />,
  messages: <MessagesIcon size={14} />,
};

const VIEW_CLASSES: Record<ResultsView, string> = {
  results: styles.view,
  messages: `${styles.view} ${styles.messagesView}`,
};

interface ResultsPanelProps {
  labels: Record<ResultsView, Localized>;
  text: Localized<ResultsText>;
}

interface RunViewsProps extends ResultsPanelProps {
  run: Run;
}

function RunViews({ run, labels, text }: Readonly<RunViewsProps>) {
  const baseId = useId();
  const loadedAt = useLoadedAt();
  const views: readonly ResultsView[] =
    run.status === "error" ? ["messages"] : VIEWS;
  const [chosen, setChosen] = useState<ResultsView>("results");
  const active = views.includes(chosen) ? chosen : views[0];
  const tabRefs = useRef(new Map<ResultsView, HTMLButtonElement>());

  function select(view: ResultsView) {
    setChosen(view);
    tabRefs.current.get(view)?.focus();
  }

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    const index = views.indexOf(active);
    const last = views.length - 1;
    const targets: Record<string, number> = {
      ArrowRight: index === last ? 0 : index + 1,
      ArrowLeft: index === 0 ? last : index - 1,
      Home: 0,
      End: last,
    };
    const target = targets[event.key];
    if (target === undefined) {
      return;
    }
    event.preventDefault();
    select(views[target]);
  }

  function content(view: ResultsView): ReactNode {
    if (run.status === "executing") {
      return null;
    }
    const completedAt = run.completedAt ?? loadedAt;
    return (
      <LocaleBlocks>
        {(locale) => {
          const outcome = run.outcomes[locale];
          if (view === "messages") {
            return (
              <MessagesPane
                outcome={outcome}
                text={text[locale]}
                completedAt={completedAt}
              />
            );
          }
          return (
            outcome.kind === "rows" && (
              <ResultsGrid
                resultSet={outcome.resultSet}
                rowNumberLabel={text[locale].rowNumber}
                newTabLabel={text[locale].opensInNewTab}
              />
            )
          );
        }}
      </LocaleBlocks>
    );
  }

  return (
    <div className={styles.panel}>
      <div role="tablist" className={styles.tabs} onKeyDown={handleKeyDown}>
        {views.map((view) => (
          <button
            key={view}
            ref={(element) => {
              if (element) {
                tabRefs.current.set(view, element);
              }
              return () => {
                tabRefs.current.delete(view);
              };
            }}
            id={`${baseId}-${view}-tab`}
            type="button"
            role="tab"
            aria-selected={active === view}
            aria-controls={`${baseId}-${view}-panel`}
            tabIndex={active === view ? 0 : -1}
            className={styles.tab}
            onClick={() => setChosen(view)}
          >
            {VIEW_ICONS[view]}
            <LocaleText text={labels[view]} />
          </button>
        ))}
      </div>
      {views.map((view) => (
        <div
          key={view}
          id={`${baseId}-${view}-panel`}
          role="tabpanel"
          aria-labelledby={`${baseId}-${view}-tab`}
          tabIndex={0}
          hidden={active !== view}
          className={VIEW_CLASSES[view]}
        >
          {content(view)}
        </div>
      ))}
    </div>
  );
}

export function ResultsPanel(props: Readonly<ResultsPanelProps>) {
  const { activeSection, activeRun } = useWorkspace();
  return (
    <RunViews
      key={`${activeSection}-${activeRun.id}`}
      run={activeRun}
      {...props}
    />
  );
}
