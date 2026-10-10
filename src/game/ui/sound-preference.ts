const KEY = "game-sound";
const OFF = "off";

function session(): Storage | null {
  try {
    return window.sessionStorage;
  } catch {
    return null;
  }
}

export function readMuted(storage: Storage | null = session()): boolean {
  try {
    return storage?.getItem(KEY) === OFF;
  } catch {
    return false;
  }
}

export function rememberMuted(
  muted: boolean,
  storage: Storage | null = session(),
): void {
  try {
    storage?.setItem(KEY, muted ? OFF : "on");
  } catch {
    return;
  }
}
