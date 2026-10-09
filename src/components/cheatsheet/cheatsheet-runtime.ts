import { PROFILE_ATTRIBUTE } from "@/components/connect/connection-runtime";
import type { Profile } from "@/content/profiles";

export const CHEATSHEET_ATTRIBUTE = "data-cheatsheet";
export const CHEATSHEET_STORAGE_KEY = "cheatsheet";

export type CheatsheetState = "open" | "closed";

const COLLAPSED_PROFILE: Profile = "dev";

const json = JSON.stringify;

export const CHEATSHEET_SCRIPT = `(function(){var root=document.documentElement;var state=null;try{state=sessionStorage.getItem(${json(CHEATSHEET_STORAGE_KEY)})}catch(error){}if(state!=="open"&&state!=="closed"){state=root.getAttribute(${json(PROFILE_ATTRIBUTE)})===${json(COLLAPSED_PROFILE)}?"closed":"open"}root.setAttribute(${json(CHEATSHEET_ATTRIBUTE)},state)})()`;

export function isCheatsheetState(value: unknown): value is CheatsheetState {
  return value === "open" || value === "closed";
}

export function defaultCheatsheet(profile: Profile): CheatsheetState {
  return profile === COLLAPSED_PROFILE ? "closed" : "open";
}

export function readStoredCheatsheet(
  storage?: Pick<Storage, "getItem">,
): CheatsheetState | null {
  try {
    const stored = (storage ?? window.sessionStorage).getItem(
      CHEATSHEET_STORAGE_KEY,
    );
    return isCheatsheetState(stored) ? stored : null;
  } catch {
    return null;
  }
}

export function storeCheatsheet(
  state: CheatsheetState,
  storage?: Pick<Storage, "setItem">,
): boolean {
  try {
    (storage ?? window.sessionStorage).setItem(CHEATSHEET_STORAGE_KEY, state);
    return true;
  } catch {
    return false;
  }
}

export function applyCheatsheet(
  state: CheatsheetState,
  root: Pick<HTMLElement, "setAttribute"> = document.documentElement,
): void {
  root.setAttribute(CHEATSHEET_ATTRIBUTE, state);
}

export function readCheatsheet(
  root: Pick<HTMLElement, "getAttribute"> = document.documentElement,
): CheatsheetState {
  const state = root.getAttribute(CHEATSHEET_ATTRIBUTE);
  return isCheatsheetState(state) ? state : "open";
}

export function subscribeToCheatsheet(onChange: () => void): () => void {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: [CHEATSHEET_ATTRIBUTE],
  });
  return () => observer.disconnect();
}
