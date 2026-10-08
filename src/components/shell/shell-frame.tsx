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
  statusBar: ReactNode;
}

function focusTree(container: HTMLElement | null) {
  container
    ?.querySelector<HTMLElement>('[role="treeitem"][tabindex="0"]')
    ?.focus();
}

export function ShellFrame({
  titleBar,
  toolbar,
  explorer,
  workspace,
  statusBar,
}: Readonly<ShellFrameProps>) {
  const compact = useMediaQuery(COMPACT_MEDIA_QUERY);
  const [drawerRequested, setDrawerRequested] = useState(false);
  const explorerOpen = compact && drawerRequested;
  const explorerRef = useRef<HTMLDivElement>(null);

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
        <div className={styles.chrome} inert={explorerOpen}>
          {titleBar}
          {toolbar}
        </div>
        <div
          id={EXPLORER_ID}
          ref={explorerRef}
          className={styles.explorer}
          data-open={explorerOpen}
          onKeyDown={handleExplorerKeyDown}
        >
          {explorer}
        </div>
        <div
          className={styles.backdrop}
          hidden={!explorerOpen}
          onClick={closeExplorer}
        />
        <div className={styles.workspace} inert={explorerOpen}>
          {workspace}
        </div>
        <div className={styles.status} inert={explorerOpen}>
          {statusBar}
        </div>
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
