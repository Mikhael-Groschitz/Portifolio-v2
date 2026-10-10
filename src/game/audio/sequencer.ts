import type { Track, TrackEvent } from "./tracks";

export const LOOKAHEAD = 0.15;
export const LATE = 0.05;

export interface Cursor {
  index: number;
  cycle: number;
  time: number;
}

export function createCursor(): Cursor {
  return { index: 0, cycle: 0, time: 0 };
}

export function resetCursor(cursor: Cursor): void {
  cursor.index = 0;
  cursor.cycle = 0;
  cursor.time = 0;
}

export function advance(
  track: Track,
  start: number,
  cursor: Cursor,
  until: number,
): TrackEvent | null {
  if (cursor.index >= track.events.length) {
    if (!track.loop || track.events.length === 0) {
      return null;
    }
    cursor.index = 0;
    cursor.cycle += 1;
  }
  const event = track.events[cursor.index];
  const time =
    start + (cursor.cycle * track.length + event.beat) * track.secondsPerBeat;
  if (time >= until) {
    return null;
  }
  cursor.index += 1;
  cursor.time = time;
  return event;
}

export function secondsOf(track: Track, event: TrackEvent): number {
  return event.beats * track.secondsPerBeat;
}

export function endOf(track: Track, start: number): number {
  return track.loop
    ? Number.POSITIVE_INFINITY
    : start + track.length * track.secondsPerBeat;
}
