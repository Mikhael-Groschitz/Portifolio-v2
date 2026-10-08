"use client";

import { useSyncExternalStore } from "react";
import {
  type ConnectionStatus,
  readConnectionStatus,
  subscribeToConnection,
} from "./connection-runtime";

function readOnServer(): ConnectionStatus {
  return "unknown";
}

function readInBrowser(): ConnectionStatus {
  return readConnectionStatus();
}

export function useConnectionStatus(): ConnectionStatus {
  return useSyncExternalStore(
    subscribeToConnection,
    readInBrowser,
    readOnServer,
  );
}
