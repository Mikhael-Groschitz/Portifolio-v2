export const TIME_TRAVEL_STORAGE_KEY = "time-travel";

const DESTINATION = "v1";

export function markDeparture(storage?: Pick<Storage, "setItem">): boolean {
  try {
    (storage ?? window.sessionStorage).setItem(
      TIME_TRAVEL_STORAGE_KEY,
      DESTINATION,
    );
    return true;
  } catch {
    return false;
  }
}

export function takeArrival(
  storage?: Pick<Storage, "getItem" | "removeItem">,
): boolean {
  try {
    const target = storage ?? window.sessionStorage;
    const departed = target.getItem(TIME_TRAVEL_STORAGE_KEY) === DESTINATION;
    target.removeItem(TIME_TRAVEL_STORAGE_KEY);
    return departed;
  } catch {
    return false;
  }
}

export function prefersReducedMotion(): boolean {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}
