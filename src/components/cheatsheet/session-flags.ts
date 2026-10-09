export type SessionFlag = "tour-seen" | "tables-explored";

const remembered = new Set<SessionFlag>();
const listeners = new Set<() => void>();

export function readFlag(
  flag: SessionFlag,
  storage?: Pick<Storage, "getItem">,
): boolean {
  if (remembered.has(flag)) {
    return true;
  }
  try {
    return (storage ?? window.sessionStorage).getItem(flag) === "1";
  } catch {
    return false;
  }
}

function persist(
  flag: SessionFlag,
  storage?: Pick<Storage, "setItem">,
): boolean {
  try {
    (storage ?? window.sessionStorage).setItem(flag, "1");
    return true;
  } catch {
    return false;
  }
}

export function setFlag(
  flag: SessionFlag,
  storage?: Pick<Storage, "setItem">,
): boolean {
  remembered.add(flag);
  const persisted = persist(flag, storage);
  for (const listener of listeners) {
    listener();
  }
  return persisted;
}

export function subscribeToFlags(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
