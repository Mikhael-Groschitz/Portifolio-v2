"use client";

import {
  type ReactNode,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import { useConnectionStatus } from "@/components/connect/use-connection-status";
import { WIDE_MEDIA_QUERY } from "@/components/shell/breakpoints";
import { useMediaQuery } from "@/components/shell/use-media-query";
import type { Profile } from "@/content/profiles";
import type { TourStepId } from "@/content/types";
import {
  type CheatsheetState,
  applyCheatsheet,
  defaultCheatsheet,
  readCheatsheet,
  readStoredCheatsheet,
  storeCheatsheet,
  subscribeToCheatsheet,
} from "./cheatsheet-runtime";
import {
  type SessionFlag,
  readFlag,
  setFlag,
  subscribeToFlags,
} from "./session-flags";

export const TOUR_STEPS: readonly TourStepId[] = ["tables", "results", "query"];
export const CHEATSHEET_ID = "cheatsheet";

const TOUR_DELAY_MS = 400;

interface GuideContextValue {
  docked: boolean;
  dockOpen: boolean;
  sheetOpen: boolean;
  openCheatsheet: () => void;
  closeCheatsheet: () => void;
  tourIndex: number | null;
  startTour: () => void;
  nextTourStep: () => void;
  finishTour: () => void;
  pulse: boolean;
  tableOpened: () => void;
  afterConnect: (profile: Profile) => void;
}

const GuideContext = createContext<GuideContextValue | null>(null);

function readDockOnServer(): CheatsheetState {
  return "open";
}

function readDockInBrowser(): CheatsheetState {
  return readCheatsheet();
}

function useSessionFlag(flag: SessionFlag, onServer: boolean): boolean {
  return useSyncExternalStore(
    subscribeToFlags,
    () => readFlag(flag),
    () => onServer,
  );
}

function activeElement(): HTMLElement | null {
  return document.activeElement instanceof HTMLElement
    ? document.activeElement
    : null;
}

function focusLater(selector: string) {
  requestAnimationFrame(() =>
    document.querySelector<HTMLElement>(selector)?.focus(),
  );
}

export function GuideProvider({ children }: Readonly<{ children: ReactNode }>) {
  const docked = useMediaQuery(WIDE_MEDIA_QUERY);
  const dock = useSyncExternalStore(
    subscribeToCheatsheet,
    readDockInBrowser,
    readDockOnServer,
  );
  const connected = useConnectionStatus() === "connected";
  const explored = useSessionFlag("tables-explored", true);
  const [sheetRequested, setSheetRequested] = useState(false);
  const [tourIndex, setTourIndex] = useState<number | null>(null);
  const sheetReturnFocus = useRef<HTMLElement | null>(null);
  const tourReturnFocus = useRef<HTMLElement | null>(null);
  const timers = useRef(new Set<number>());
  const sheetOpen = !docked && sheetRequested;

  useEffect(() => {
    const pending = timers.current;
    return () => {
      for (const timer of pending) {
        window.clearTimeout(timer);
      }
    };
  }, []);

  const openCheatsheet = useCallback(() => {
    if (docked) {
      applyCheatsheet("open");
      storeCheatsheet("open");
    } else {
      sheetReturnFocus.current = activeElement();
      setSheetRequested(true);
    }
    focusLater(`#${CHEATSHEET_ID} [data-cheatsheet-item]`);
  }, [docked]);

  const closeCheatsheet = useCallback(() => {
    if (docked) {
      applyCheatsheet("closed");
      storeCheatsheet("closed");
      focusLater("[data-cheatsheet-tab]");
    } else {
      setSheetRequested(false);
      sheetReturnFocus.current?.focus();
    }
  }, [docked]);

  const startTour = useCallback(() => {
    setFlag("tour-seen");
    setSheetRequested(false);
    tourReturnFocus.current = activeElement();
    setTourIndex(0);
  }, []);

  const finishTour = useCallback(() => {
    setTourIndex(null);
    const target = tourReturnFocus.current;
    if (target?.isConnected) {
      target.focus();
    } else {
      document
        .querySelector<HTMLElement>('[role="menubar"] [tabindex="0"]')
        ?.focus();
    }
  }, []);

  const nextTourStep = useCallback(() => {
    if (tourIndex === null || tourIndex >= TOUR_STEPS.length - 1) {
      finishTour();
    } else {
      setTourIndex(tourIndex + 1);
    }
  }, [finishTour, tourIndex]);

  const tableOpened = useCallback(() => {
    setFlag("tables-explored");
    setTourIndex((index) => (index === 0 ? 1 : index));
  }, []);

  const afterConnect = useCallback(
    (profile: Profile) => {
      applyCheatsheet(readStoredCheatsheet() ?? defaultCheatsheet(profile));
      if (profile !== "visitor" || readFlag("tour-seen")) {
        return;
      }
      const timer = window.setTimeout(() => {
        timers.current.delete(timer);
        startTour();
      }, TOUR_DELAY_MS);
      timers.current.add(timer);
    },
    [startTour],
  );

  const value = useMemo(
    () => ({
      docked,
      dockOpen: dock === "open",
      sheetOpen,
      openCheatsheet,
      closeCheatsheet,
      tourIndex,
      startTour,
      nextTourStep,
      finishTour,
      pulse: connected && !explored && tourIndex === null,
      tableOpened,
      afterConnect,
    }),
    [
      docked,
      dock,
      sheetOpen,
      openCheatsheet,
      closeCheatsheet,
      tourIndex,
      startTour,
      nextTourStep,
      finishTour,
      connected,
      explored,
      tableOpened,
      afterConnect,
    ],
  );

  return <GuideContext value={value}>{children}</GuideContext>;
}

export function useGuide(): GuideContextValue {
  const value = useContext(GuideContext);
  if (!value) {
    throw new Error("useGuide must be used inside GuideProvider");
  }
  return value;
}
