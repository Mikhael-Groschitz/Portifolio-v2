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
} from "react";
import { SECTION_IDS, type SectionId } from "@/content/types";
import { sectionFromSegment, sectionPath } from "./section-routes";
import {
  initialWorkspace,
  neighborAfterClose,
  withActive,
  workspaceReducer,
} from "./workspace-state";

interface WorkspaceContextValue {
  tabs: readonly SectionId[];
  activeSection: SectionId;
  openSection: (section: SectionId) => void;
  closeSection: (section: SectionId) => void;
}

const WorkspaceContext = createContext<WorkspaceContextValue | null>(null);

export function WorkspaceProvider({
  children,
}: Readonly<{ children: ReactNode }>) {
  const router = useRouter();
  const activeSection = sectionFromSegment(useSelectedLayoutSegment());
  const [state, dispatch] = useReducer(
    workspaceReducer,
    activeSection,
    initialWorkspace,
  );
  const tabs = withActive(state.tabs, activeSection);

  useEffect(() => {
    for (const section of SECTION_IDS) {
      router.prefetch(sectionPath(section));
    }
  }, [router]);

  const openSection = useCallback(
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

  const value = useMemo(
    () => ({ tabs, activeSection, openSection, closeSection }),
    [tabs, activeSection, openSection, closeSection],
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
