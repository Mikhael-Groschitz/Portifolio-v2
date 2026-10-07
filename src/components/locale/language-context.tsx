"use client";

import {
  type ReactNode,
  createContext,
  useCallback,
  useContext,
  useLayoutEffect,
  useMemo,
  useSyncExternalStore,
} from "react";
import { DEFAULT_LOCALE, type Locale } from "@/content/locales";
import {
  applyLocale,
  readAppliedLocale,
  readStoredLocale,
  resolveInitialLocale,
  storeLocale,
  subscribeToLocale,
} from "./locale-runtime";

interface LanguageContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

function readServerLocale(): Locale {
  return DEFAULT_LOCALE;
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const locale = useSyncExternalStore(
    subscribeToLocale,
    readAppliedLocale,
    readServerLocale,
  );

  useLayoutEffect(() => {
    applyLocale(resolveInitialLocale(readStoredLocale(), navigator.languages));
  }, []);

  const setLocale = useCallback((next: Locale) => {
    applyLocale(next);
    storeLocale(next);
  }, []);

  const value = useMemo(() => ({ locale, setLocale }), [locale, setLocale]);

  return <LanguageContext value={value}>{children}</LanguageContext>;
}

export function useLanguage(): LanguageContextValue {
  const value = useContext(LanguageContext);
  if (!value) {
    throw new Error("useLanguage must be used inside LanguageProvider");
  }
  return value;
}
