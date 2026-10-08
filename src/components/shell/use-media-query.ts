"use client";

import { useCallback, useSyncExternalStore } from "react";

function matchesOnServer(): boolean {
  return false;
}

export function useMediaQuery(query: string): boolean {
  const subscribe = useCallback(
    (onChange: () => void) => {
      const list = window.matchMedia(query);
      list.addEventListener("change", onChange);
      return () => list.removeEventListener("change", onChange);
    },
    [query],
  );
  const matches = useCallback(() => window.matchMedia(query).matches, [query]);

  return useSyncExternalStore(subscribe, matches, matchesOnServer);
}
