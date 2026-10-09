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
} from "react";
import { QUERY_DOCUMENT } from "@/components/shell/section-routes";
import { useWorkspace } from "@/components/shell/workspace-context";
import { V1_DATABASE } from "@/engine/catalog";
import {
  markDeparture,
  prefersReducedMotion,
  takeArrival,
} from "./time-travel-runtime";
import { V1_URL } from "./v1-url";

export const TRAVEL_COMMAND = `USE ${V1_DATABASE};`;

const TYPING_INTERVAL_MS = 45;
const DEPARTURE_MS = 2000;
const STILL_DEPARTURE_MS = 1000;
const REGENERATION_MS = 3000;

interface EasterEggValue {
  traveling: boolean;
  regenerating: boolean;
  boardTardis: () => void;
}

const EasterEggContext = createContext<EasterEggValue | null>(null);

export function EasterEggProvider({
  children,
}: Readonly<{ children: ReactNode }>) {
  const { activeDocument, effect, query, openQuery, runDocument, arrive } =
    useWorkspace();
  const [landedId, setLandedId] = useState<number | null>(null);
  const [settledId, setSettledId] = useState<number | null>(null);
  const traveling = effect?.kind === "travel" && effect.id !== landedId;
  const regenerating = effect?.kind === "regenerate" && effect.id !== settledId;
  const awaitingQuery = useRef(false);
  const typing = useRef(false);
  const timers = useRef(new Set<number>());

  const schedule = useCallback((callback: () => void, delay: number) => {
    const timer = window.setTimeout(() => {
      timers.current.delete(timer);
      callback();
    }, delay);
    timers.current.add(timer);
  }, []);

  useEffect(() => {
    const pending = timers.current;
    return () => {
      for (const timer of pending) {
        window.clearTimeout(timer);
      }
    };
  }, []);

  useEffect(() => {
    if (!traveling || V1_URL === null) {
      return;
    }
    const destination = V1_URL;
    const timer = window.setTimeout(
      () => {
        markDeparture();
        window.location.assign(destination);
      },
      prefersReducedMotion() ? STILL_DEPARTURE_MS : DEPARTURE_MS,
    );
    return () => window.clearTimeout(timer);
  }, [traveling]);

  useEffect(() => {
    if (!regenerating || !effect) {
      return;
    }
    const { id } = effect;
    const timer = window.setTimeout(() => setSettledId(id), REGENERATION_MS);
    return () => window.clearTimeout(timer);
  }, [regenerating, effect]);

  useEffect(() => {
    if (takeArrival()) {
      arrive();
    }
  }, [arrive]);

  useEffect(() => {
    function landOnReturn(event: PageTransitionEvent) {
      if (event.persisted && traveling && effect) {
        takeArrival();
        setLandedId(effect.id);
        arrive();
      }
    }
    window.addEventListener("pageshow", landOnReturn);
    return () => window.removeEventListener("pageshow", landOnReturn);
  }, [arrive, effect, traveling]);

  const typeCommand = useCallback(() => {
    typing.current = true;
    const base = query.getSnapshot().text.trimEnd();
    const prefix = base ? `${base}\n` : "";
    const start = prefix.length;
    const launch = () => {
      query.update({
        text: prefix + TRAVEL_COMMAND,
        selectionStart: start,
        selectionEnd: start + TRAVEL_COMMAND.length,
      });
      typing.current = false;
      runDocument(QUERY_DOCUMENT);
    };
    if (prefersReducedMotion()) {
      launch();
      return;
    }
    const typeUpTo = (count: number) => {
      const text = prefix + TRAVEL_COMMAND.slice(0, count);
      query.update({
        text,
        selectionStart: text.length,
        selectionEnd: text.length,
      });
      schedule(
        count < TRAVEL_COMMAND.length ? () => typeUpTo(count + 1) : launch,
        TYPING_INTERVAL_MS,
      );
    };
    typeUpTo(0);
  }, [query, runDocument, schedule]);

  useEffect(() => {
    if (awaitingQuery.current && activeDocument === QUERY_DOCUMENT) {
      awaitingQuery.current = false;
      typeCommand();
    }
  }, [activeDocument, typeCommand]);

  const boardTardis = useCallback(() => {
    if (typing.current || awaitingQuery.current || traveling) {
      return;
    }
    openQuery();
    if (activeDocument === QUERY_DOCUMENT) {
      typeCommand();
    } else {
      awaitingQuery.current = true;
    }
  }, [activeDocument, openQuery, traveling, typeCommand]);

  const value = useMemo(
    () => ({ traveling, regenerating, boardTardis }),
    [traveling, regenerating, boardTardis],
  );

  return <EasterEggContext value={value}>{children}</EasterEggContext>;
}

export function useEasterEggs(): EasterEggValue {
  const value = useContext(EasterEggContext);
  if (!value) {
    throw new Error("useEasterEggs must be used inside EasterEggProvider");
  }
  return value;
}
