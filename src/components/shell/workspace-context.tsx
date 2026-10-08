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
} from "react";
import { SECTION_IDS, type SectionId } from "@/content/types";
import { executeSection } from "./section-execution";
import { sectionFromSegment, sectionPath } from "./section-routes";
import {
  type Run,
  connectionRun,
  initialWorkspace,
  neighborAfterClose,
  userRun,
  withActive,
  workspaceReducer,
} from "./workspace-state";

const EXECUTION_DELAY_MS = 150;

interface WorkspaceContextValue {
  tabs: readonly SectionId[];
  activeSection: SectionId;
  activeRun: Run;
  activateSection: (section: SectionId) => void;
  openSection: (section: SectionId) => void;
  runSection: (section: SectionId) => void;
  closeSection: (section: SectionId) => void;
  connect: () => void;
}

const WorkspaceContext = createContext<WorkspaceContextValue | null>(null);

function startWorkspace(section: SectionId) {
  return initialWorkspace(section, executeSection(section));
}

export function WorkspaceProvider({
  children,
}: Readonly<{ children: ReactNode }>) {
  const router = useRouter();
  const activeSection = sectionFromSegment(useSelectedLayoutSegment());
  const [state, dispatch] = useReducer(
    workspaceReducer,
    activeSection,
    startWorkspace,
  );
  const tabs = withActive(state.tabs, activeSection);
  const storedRun = state.runs[activeSection];
  const activeRun = useMemo(
    () => storedRun ?? connectionRun(executeSection(activeSection)),
    [storedRun, activeSection],
  );
  const runIds = useRef(0);
  const timers = useRef(new Set<number>());

  useEffect(() => {
    for (const section of SECTION_IDS) {
      router.prefetch(sectionPath(section));
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

  const runSection = useCallback((section: SectionId) => {
    runIds.current += 1;
    const id = runIds.current;
    const startedAt = performance.now();
    dispatch({ type: "start", section, id });
    const timer = window.setTimeout(() => {
      timers.current.delete(timer);
      dispatch({
        type: "finish",
        section,
        run: userRun(
          id,
          executeSection(section),
          new Date(),
          performance.now() - startedAt,
        ),
      });
    }, EXECUTION_DELAY_MS);
    timers.current.add(timer);
  }, []);

  const activateSection = useCallback(
    (section: SectionId) => {
      startTransition(() => {
        dispatch({ type: "open", section, active: activeSection });
        if (section !== activeSection) {
          router.push(sectionPath(section), { scroll: false });
        }
      });
    },
    [activeSection, router],
  );

  const openSection = useCallback(
    (section: SectionId) => {
      activateSection(section);
      runSection(section);
    },
    [activateSection, runSection],
  );

  const closeSection = useCallback(
    (section: SectionId) => {
      if (tabs.length < 2) {
        return;
      }
      startTransition(() => {
        dispatch({ type: "close", section, active: activeSection });
        if (section === activeSection) {
          router.replace(sectionPath(neighborAfterClose(tabs, section)), {
            scroll: false,
          });
        }
      });
    },
    [activeSection, router, tabs],
  );

  const connect = useCallback(() => {
    runIds.current += 1;
    dispatch({
      type: "connect",
      section: activeSection,
      run: connectionRun(executeSection(activeSection), {
        id: runIds.current,
        completedAt: new Date(),
      }),
    });
  }, [activeSection]);

  const value = useMemo(
    () => ({
      tabs,
      activeSection,
      activeRun,
      activateSection,
      openSection,
      runSection,
      closeSection,
      connect,
    }),
    [
      tabs,
      activeSection,
      activeRun,
      activateSection,
      openSection,
      runSection,
      closeSection,
      connect,
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
