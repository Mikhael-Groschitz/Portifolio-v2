"use client";

import type { ReactNode } from "react";
import {
  ConnectedIcon,
  SpinnerIcon,
  SuccessIcon,
  WarningIcon,
} from "@/components/icons";
import { LocaleText } from "@/components/locale/locale-text";
import { formatCount, formatElapsed } from "@/content/format";
import { type Localized, mapLocalized } from "@/content/locales";
import type { ConnectionText } from "@/content/types";
import { DATABASE, SERVER } from "@/engine/catalog";
import { useWorkspace } from "./workspace-context";
import type { Run } from "./workspace-state";
import styles from "./bars.module.css";

type StatusKey = "connected" | "executing" | "succeeded" | "failed";

const STATUS_ICONS: Record<StatusKey, ReactNode> = {
  connected: <ConnectedIcon />,
  executing: <SpinnerIcon />,
  succeeded: <SuccessIcon />,
  failed: <WarningIcon />,
};

function statusOf(run: Run): StatusKey {
  if (run.status === "executing") {
    return "executing";
  }
  if (run.status === "error") {
    return "failed";
  }
  return run.origin === "connection" ? "connected" : "succeeded";
}

function rowCountOf(run: Run): number {
  if (run.status !== "done") {
    return 0;
  }
  const outcome = run.outcomes["pt-BR"];
  return outcome.kind === "rows" ? outcome.resultSet.rows.length : 0;
}

export function ConnectionBar({
  text,
}: Readonly<{ text: Localized<ConnectionText> }>) {
  const { activeRun } = useWorkspace();
  const status = statusOf(activeRun);
  const rows = rowCountOf(activeRun);
  const elapsed = activeRun.status === "executing" ? 0 : activeRun.elapsedMs;

  return (
    <div className={styles.connectionBar}>
      <span className={styles.connectionStatus}>
        {STATUS_ICONS[status]}
        <span role="status">
          <LocaleText text={mapLocalized(text, (bar) => bar[status])} />
        </span>
      </span>
      <span className={`${styles.segment} ${styles.detail}`}>
        {`${SERVER.name} (${SERVER.version} RTM)`}
      </span>
      <span className={`${styles.segment} ${styles.detail}`}>
        <LocaleText text={mapLocalized(text, (bar) => bar.login)} />
      </span>
      <span className={styles.segment}>{DATABASE}</span>
      <span className={styles.segment}>{formatElapsed(elapsed)}</span>
      <span className={styles.segment}>
        <LocaleText
          text={mapLocalized(text, (bar) => formatCount(bar.rows, rows))}
        />
      </span>
    </div>
  );
}
