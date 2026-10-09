"use client";

import { useRouter, useSelectedLayoutSegment } from "next/navigation";
import {
  type ReactNode,
  createContext,
  startTransition,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
} from "react";
import { readConnectionStatus } from "@/components/connect/connection-runtime";
import {
  type QueryStore,
  createQueryStore,
  queryToRun,
} from "@/components/editor/query-store";
import { type Localized, byLocale } from "@/content/locales";
import { SECTION_IDS, type SectionId } from "@/content/types";
import { arrivalOutcome } from "@/engine/easter-eggs";
import type { ExecutionOutcome } from "@/engine/execute";
import { executeQuery, executeSection } from "./section-execution";
import {
  type DocumentId,
  QUERY_DOCUMENT,
  documentFromSegment,
  documentPath,
  isQueryDocument,
} from "./section-routes";
import {
  type Run,
  type RunEffect,
  connectionRun,
  initialWorkspace,
  neighborAfterClose,
  userRun,
  withActive,
  workspaceReducer,
} from "./workspace-state";

const EXECUTION_DELAY_MS = 150;

interface WorkspaceContextValue {
  tabs: readonly DocumentId[];
  activeDocument: DocumentId;
  activeRun: Run | null;
  effect: RunEffect | null;
  query: QueryStore;
  activateDocument: (document: DocumentId) => void;
  openSection: (section: SectionId) => void;
  openQuery: () => void;
  runDocument: (document: DocumentId) => void;
  closeDocument: (document: DocumentId) => void;
  connect: () => void;
  arrive: () => void;
}

const WorkspaceContext = createContext<WorkspaceContextValue | null>(null);

function connectionOutcomes(
  document: DocumentId,
): Localized<ExecutionOutcome> | null {
  return isQueryDocument(document) ? null : executeSection(document);
}

function startWorkspace(document: DocumentId) {
  return initialWorkspace(document, connectionOutcomes(document));
}

function isNewQueryShortcut(event: KeyboardEvent): boolean {
  return (
    event.code === "KeyN" &&
    event.altKey !== event.ctrlKey &&
    !event.shiftKey &&
    !event.metaKey
  );
}

export function WorkspaceProvider({
  children,
}: Readonly<{ children: ReactNode }>) {
  const router = useRouter();
  const activeDocument = documentFromSegment(useSelectedLayoutSegment());
  const [state, dispatch] = useReducer(
    workspaceReducer,
    activeDocument,
    startWorkspace,
  );
  const [query] = useState(createQueryStore);
  const tabs = withActive(state.tabs, activeDocument);
  const storedRun = state.runs[activeDocument];
  const activeRun = useMemo(() => {
    if (storedRun) {
      return storedRun;
    }
    const outcomes = connectionOutcomes(activeDocument);
    return outcomes ? connectionRun(outcomes) : null;
  }, [storedRun, activeDocument]);
  const runIds = useRef(0);
  const timers = useRef(new Set<number>());

  useEffect(() => {
    for (const section of SECTION_IDS) {
      router.prefetch(documentPath(section));
    }
  }, [router]);

  useEffect(() => {
    const pending = timers.current;
    return () => {
      for (const timer of pending) {
        window.clearTimeout(timer);
      }
    };
  }, []);

  const runDocument = useCallback(
    (document: DocumentId) => {
      runIds.current += 1;
      const id = runIds.current;
      const startedAt = performance.now();
      const seed = Math.random();
      const input = queryToRun(query.getSnapshot());
      const outcomes = () =>
        isQueryDocument(document)
          ? executeQuery(input, seed)
          : executeSection(document);
      dispatch({ type: "start", document, id });
      const timer = window.setTimeout(() => {
        timers.current.delete(timer);
        dispatch({
          type: "finish",
          document,
          run: userRun(
            id,
            outcomes(),
            new Date(),
            performance.now() - startedAt,
          ),
        });
      }, EXECUTION_DELAY_MS);
      timers.current.add(timer);
    },
    [query],
  );

  const activateDocument = useCallback(
    (document: DocumentId) => {
      startTransition(() => {
        dispatch({ type: "open", document, active: activeDocument });
        if (document !== activeDocument) {
          router.push(documentPath(document), { scroll: false });
        }
      });
    },
    [activeDocument, router],
  );

  const openSection = useCallback(
    (section: SectionId) => {
      activateDocument(section);
      runDocument(section);
    },
    [activateDocument, runDocument],
  );

  const openQuery = useCallback(() => {
    query.requestFocus();
    activateDocument(QUERY_DOCUMENT);
  }, [activateDocument, query]);

  const closeDocument = useCallback(
    (document: DocumentId) => {
      if (tabs.length < 2) {
        return;
      }
      if (isQueryDocument(document)) {
        query.reset();
      }
      startTransition(() => {
        dispatch({ type: "close", document, active: activeDocument });
        if (document === activeDocument) {
          router.replace(documentPath(neighborAfterClose(tabs, document)), {
            scroll: false,
          });
        }
      });
    },
    [activeDocument, query, router, tabs],
  );

  const connect = useCallback(() => {
    const outcomes = connectionOutcomes(activeDocument);
    if (!outcomes) {
      return;
    }
    runIds.current += 1;
    dispatch({
      type: "connect",
      document: activeDocument,
      run: connectionRun(outcomes, {
        id: runIds.current,
        completedAt: new Date(),
      }),
    });
  }, [activeDocument]);

  const arrive = useCallback(() => {
    runIds.current += 1;
    dispatch({
      type: "connect",
      document: QUERY_DOCUMENT,
      run: connectionRun(
        byLocale(() => arrivalOutcome()),
        { id: runIds.current, completedAt: new Date() },
      ),
    });
  }, []);

  useEffect(() => {
    function openOnShortcut(event: KeyboardEvent) {
      if (isNewQueryShortcut(event) && readConnectionStatus() !== "pending") {
        event.preventDefault();
        openQuery();
      }
    }
    document.addEventListener("keydown", openOnShortcut);
    return () => document.removeEventListener("keydown", openOnShortcut);
  }, [openQuery]);

  const value = useMemo(
    () => ({
      tabs,
      activeDocument,
      activeRun,
      effect: state.effect,
      query,
      activateDocument,
      openSection,
      openQuery,
      runDocument,
      closeDocument,
      connect,
      arrive,
    }),
    [
      tabs,
      activeDocument,
      activeRun,
      state.effect,
      query,
      activateDocument,
      openSection,
      openQuery,
      runDocument,
      closeDocument,
      connect,
      arrive,
    ],
  );

  return <WorkspaceContext value={value}>{children}</WorkspaceContext>;
}

export function useWorkspace(): WorkspaceContextValue {
  const value = useContext(WorkspaceContext);
  if (!value) {
    throw new Error("useWorkspace must be used inside WorkspaceProvider");
  }
  return value;
}
