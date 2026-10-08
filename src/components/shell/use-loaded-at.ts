"use client";

import { useSyncExternalStore } from "react";

let loadedAt: Date | null = null;

function readLoadedAt(): Date {
  loadedAt ??= new Date();
  return loadedAt;
}

function readOnServer(): null {
  return null;
}

function subscribe(): () => void {
  return () => {};
}

export function useLoadedAt(): Date | null {
  return useSyncExternalStore(subscribe, readLoadedAt, readOnServer);
}
