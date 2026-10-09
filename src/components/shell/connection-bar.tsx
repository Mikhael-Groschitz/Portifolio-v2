"use client";

import type { ReactNode } from "react";
import {
  ConnectedIcon,
  SpinnerIcon,
  SuccessIcon,
  TardisIcon,
  WarningIcon,
} from "@/components/icons";
import { ProfileText } from "@/components/connect/profile-text";
import { useEasterEggs } from "@/components/easter-eggs/easter-egg-context";
import { LocaleText } from "@/components/locale/locale-text";
import { formatCount, formatElapsed } from "@/content/format";
import { type Localized, mapLocalized } from "@/content/locales";
import { byProfile } from "@/content/profiles";
import type { ConnectionText } from "@/content/types";
import { DATABASE, SERVER, V1_DATABASE } from "@/engine/catalog";
import { rowCountOf } from "@/engine/execute";
import { useWorkspace } from "./workspace-context";
import type { Run } from "./workspace-state";
import styles from "./bars.module.css";

type StatusKey =
  "connected" | "executing" | "succeeded" | "failed" | "traveling";

const STATUS_ICONS: Record<StatusKey, ReactNode> = {
  connected: <ConnectedIcon />,
  executing: <SpinnerIcon />,
  succeeded: <SuccessIcon />,
  failed: <WarningIcon />,
  traveling: <TardisIcon />,
};

function statusOf(run: Run | null): StatusKey {
  if (!run || (run.status === "done" && run.origin === "connection")) {
    return "connected";
  }
  if (run.status === "executing") {
    return "executing";
  }
  return run.status === "error" ? "failed" : "succeeded";
}

function rowsOf(run: Run | null): number {
  return run?.status === "done" ? rowCountOf(run.outcomes["pt-BR"]) : 0;
}

function elapsedOf(run: Run | null): number {
  return run && run.status !== "executing" ? run.elapsedMs : 0;
}

export function ConnectionBar({
  text,
}: Readonly<{ text: Localized<ConnectionText> }>) {
  const { activeRun } = useWorkspace();
  const { traveling, boardTardis } = useEasterEggs();
  const status = traveling ? "traveling" : statusOf(activeRun);
  const rows = rowsOf(activeRun);
  const elapsed = elapsedOf(activeRun);
  const rowsText = mapLocalized(text, (bar) => formatCount(bar.rows, rows));

  return (
    <div
      className={
        traveling
          ? `${styles.connectionBar} ${styles.traveling}`
          : styles.connectionBar
      }
    >
      <span className={styles.connectionStatus}>
        {STATUS_ICONS[status]}
        <span role="status">
          <LocaleText text={mapLocalized(text, (bar) => bar[status])} />
          {status === "succeeded" && (
            <span className="visually-hidden">
              {" "}
              <LocaleText text={rowsText} />
            </span>
          )}
        </span>
      </span>
      <span className={`${styles.segment} ${styles.detail}`}>
        {`${SERVER.name} (${SERVER.version} RTM)`}
      </span>
      <span className={`${styles.segment} ${styles.detail}`}>
        <ProfileText
          text={byProfile((profile) =>
            mapLocalized(text, (bar) => bar.login[profile]),
          )}
        />
      </span>
      <span className={styles.segment}>
        {traveling ? V1_DATABASE : DATABASE}
      </span>
      <span className={styles.segment}>{formatElapsed(elapsed)}</span>
      <span className={styles.segment}>
        <LocaleText text={rowsText} />
      </span>
      <button type="button" className={styles.tardis} onClick={boardTardis}>
        <TardisIcon />
        <span className="visually-hidden">
          <LocaleText text={mapLocalized(text, (bar) => bar.timeTravel)} />
        </span>
      </button>
    </div>
  );
}
