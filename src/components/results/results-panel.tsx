"use client";

import {
  type KeyboardEvent,
  type ReactNode,
  useId,
  useRef,
  useState,
} from "react";
import { GridIcon, MessagesIcon } from "@/components/icons";
import { LocaleText } from "@/components/locale/locale-text";
import type { Localized } from "@/content/locales";
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
  results: ReactNode;
  messages: ReactNode;
}

export function ResultsPanel({
  labels,
  results,
  messages,
}: Readonly<ResultsPanelProps>) {
  const baseId = useId();
  const [active, setActive] = useState<ResultsView>("results");
  const tabRefs = useRef(new Map<ResultsView, HTMLButtonElement>());
  const panels: Record<ResultsView, ReactNode> = { results, messages };

  function select(view: ResultsView) {
    setActive(view);
    tabRefs.current.get(view)?.focus();
  }

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    const index = VIEWS.indexOf(active);
    const last = VIEWS.length - 1;
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
    select(VIEWS[target]);
  }

  return (
    <div className={styles.panel}>
      <div role="tablist" className={styles.tabs} onKeyDown={handleKeyDown}>
        {VIEWS.map((view) => (
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
            onClick={() => setActive(view)}
          >
            {VIEW_ICONS[view]}
            <LocaleText text={labels[view]} />
          </button>
        ))}
      </div>
      {VIEWS.map((view) => (
        <div
          key={view}
          id={`${baseId}-${view}-panel`}
          role="tabpanel"
          aria-labelledby={`${baseId}-${view}-tab`}
          tabIndex={0}
          hidden={active !== view}
          className={VIEW_CLASSES[view]}
        >
          {panels[view]}
        </div>
      ))}
    </div>
  );
}
