export const STEP_MS = 1000 / 60;

const MAX_LAG_MS = 250;

export function accumulate(lag: number, elapsed: number): number {
  return Math.min(lag + Math.max(elapsed, 0), MAX_LAG_MS);
}

export function framesToMs(frames: number): number {
  return frames * STEP_MS;
}
