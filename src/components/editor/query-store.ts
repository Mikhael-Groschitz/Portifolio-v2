export interface QuerySnapshot {
  text: string;
  selectionStart: number;
  selectionEnd: number;
}

export interface QueryStore {
  getSnapshot: () => QuerySnapshot;
  subscribe: (listener: () => void) => () => void;
  update: (next: Partial<QuerySnapshot>) => void;
  reset: () => void;
  requestFocus: () => void;
  takeFocusRequest: () => boolean;
}

const EMPTY_QUERY: QuerySnapshot = {
  text: "",
  selectionStart: 0,
  selectionEnd: 0,
};

function sameSnapshot(a: QuerySnapshot, b: QuerySnapshot): boolean {
  return (
    a.text === b.text &&
    a.selectionStart === b.selectionStart &&
    a.selectionEnd === b.selectionEnd
  );
}

export function createQueryStore(): QueryStore {
  let snapshot = EMPTY_QUERY;
  let focusRequested = false;
  const listeners = new Set<() => void>();

  function notify() {
    for (const listener of listeners) {
      listener();
    }
  }

  return {
    getSnapshot: () => snapshot,
    subscribe(listener) {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    update(next) {
      const merged = { ...snapshot, ...next };
      if (!sameSnapshot(merged, snapshot)) {
        snapshot = merged;
        notify();
      }
    },
    reset() {
      snapshot = EMPTY_QUERY;
      notify();
    },
    requestFocus() {
      focusRequested = true;
      notify();
    },
    takeFocusRequest() {
      const requested = focusRequested;
      focusRequested = false;
      return requested;
    },
  };
}

export function cursorOf(
  text: string,
  offset: number,
): { line: number; column: number } {
  const lines = text.slice(0, offset).split("\n");
  return { line: lines.length, column: (lines.at(-1) ?? "").length + 1 };
}

export function queryToRun({
  text,
  selectionStart,
  selectionEnd,
}: QuerySnapshot): string {
  return selectionEnd > selectionStart
    ? text.slice(selectionStart, selectionEnd)
    : text;
}
