"use client";

import {
  type KeyboardEvent,
  type ReactNode,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useGuide } from "@/components/cheatsheet/guide-context";
import { useConnectionStatus } from "@/components/connect/use-connection-status";
import { COMPACT_MEDIA_QUERY } from "./breakpoints";
import { useMediaQuery } from "./use-media-query";
import styles from "./shell.module.css";

export const EXPLORER_ID = "object-explorer";

interface ShellContextValue {
  explorerOpen: boolean;
  openExplorer: () => void;
  closeExplorer: () => void;
  showExplorer: () => void;
}

const ShellContext = createContext<ShellContextValue | null>(null);

interface ShellFrameProps {
  titleBar: ReactNode;
  toolbar: ReactNode;
  explorer: ReactNode;
  workspace: ReactNode;
  guide: ReactNode;
  statusBar: ReactNode;
  tour: ReactNode;
  dialog: ReactNode;
}

function focusTree(container: HTMLElement | null) {
  container
    ?.querySelector<HTMLElement>('[role="treeitem"][tabindex="0"]')
    ?.focus();
}

function focusEditor(container: HTMLElement | null) {
  container?.querySelector<HTMLElement>("[data-editor]")?.focus();
}

export function ShellFrame({
  titleBar,
  toolbar,
  explorer,
  workspace,
  guide,
  statusBar,
  tour,
  dialog,
}: Readonly<ShellFrameProps>) {
  const compact = useMediaQuery(COMPACT_MEDIA_QUERY);
  const connection = useConnectionStatus();
  const { sheetOpen, closeCheatsheet } = useGuide();
  const blocked = connection === "pending";
  const [drawerRequested, setDrawerRequested] = useState(false);
  const explorerOpen = compact && drawerRequested;
  const overlayOpen = explorerOpen || sheetOpen;
  const explorerRef = useRef<HTMLDivElement>(null);
  const workspaceRef = useRef<HTMLDivElement>(null);
  const wasBlocked = useRef(false);

  useEffect(() => {
    if (blocked) {
      wasBlocked.current = true;
      return;
    }
    if (!wasBlocked.current || connection !== "connected") {
      return;
    }
    wasBlocked.current = false;
    if (compact) {
      focusEditor(workspaceRef.current);
    } else {
      focusTree(explorerRef.current);
    }
  }, [blocked, connection, compact]);

  useEffect(() => {
    if (!explorerOpen) {
      return;
    }
    const returnFocus =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;
    focusTree(explorerRef.current);
    return () => returnFocus?.focus();
  }, [explorerOpen]);

  const openExplorer = useCallback(() => setDrawerRequested(true), []);
  const closeExplorer = useCallback(() => setDrawerRequested(false), []);
  const showExplorer = useCallback(() => {
    if (compact) {
      setDrawerRequested(true);
    } else {
      focusTree(explorerRef.current);
    }
  }, [compact]);

  const value = useMemo(
    () => ({ explorerOpen, openExplorer, closeExplorer, showExplorer }),
    [explorerOpen, openExplorer, closeExplorer, showExplorer],
  );

  function handleExplorerKeyDown(event: KeyboardEvent) {
    if (explorerOpen && event.key === "Escape") {
      event.preventDefault();
      closeExplorer();
    }
  }

  return (
    <ShellContext value={value}>
      <div className={styles.shell}>
        <div className={styles.chrome} inert={overlayOpen || blocked}>
          {titleBar}
          {toolbar}
        </div>
        <div
          id={EXPLORER_ID}
          ref={explorerRef}
          className={styles.explorer}
          data-open={explorerOpen}
          inert={sheetOpen || blocked}
          onKeyDown={handleExplorerKeyDown}
        >
          {explorer}
        </div>
        <div
          className={styles.backdrop}
          hidden={!overlayOpen}
          onClick={explorerOpen ? closeExplorer : closeCheatsheet}
        />
        <div
          ref={workspaceRef}
          className={styles.workspace}
          inert={overlayOpen || blocked}
        >
          {workspace}
        </div>
        <div className={styles.guide} inert={explorerOpen || blocked}>
          {guide}
        </div>
        <div className={styles.status} inert={overlayOpen || blocked}>
          {statusBar}
        </div>
        {tour}
        {dialog}
      </div>
    </ShellContext>
  );
}

export function useShell(): ShellContextValue {
  const value = useContext(ShellContext);
  if (!value) {
    throw new Error("useShell must be used inside ShellFrame");
  }
  return value;
}
