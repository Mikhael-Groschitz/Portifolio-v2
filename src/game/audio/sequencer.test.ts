import { describe, expect, it } from "vitest";
import {
  advance,
  createCursor,
  endOf,
  resetCursor,
  secondsOf,
} from "./sequencer";
import { type Track, compile } from "./tracks";

const LOOP: Track = compile("stage", {
  tempo: 120,
  beatsPerBar: 2,
  loop: true,
  parts: [
    {
      stop: "flute",
      velocity: 1,
      notes: [
        ["D4", 1],
        [null, 0.5],
        ["F4", 0.5],
      ],
    },
    { stop: "pedal", velocity: 1, notes: [["D2", 2]] },
  ],
});

const ONCE: Track = { ...LOOP, loop: false };

function drain(
  track: Track,
  start: number,
  until: number,
  cursor = createCursor(),
) {
  const due = [];
  for (
    let event = advance(track, start, cursor, until);
    event;
    event = advance(track, start, cursor, until)
  ) {
    due.push([event.pitches[0], cursor.time]);
  }
  return due;
}

describe("sequencer", () => {
  it("hands out only the notes that start before the lookahead horizon", () => {
    const cursor = createCursor();
    expect(drain(LOOP, 10, 10.1, cursor)).toEqual([
      [62, 10],
      [38, 10],
    ]);
    expect(drain(LOOP, 10, 10.7, cursor)).toEqual([]);
    expect(drain(LOOP, 10, 10.8, cursor)).toEqual([[65, 10.75]]);
  });

  it("starts the loop over without a gap", () => {
    expect(drain(LOOP, 0, 1.01).map(([, time]) => time)).toEqual([
      0, 0, 0.75, 1, 1,
    ]);
  });

  it("stops a one-shot track at its end", () => {
    expect(drain(ONCE, 0, 5)).toHaveLength(3);
    expect(endOf(ONCE, 2)).toBe(3);
    expect(endOf(LOOP, 2)).toBe(Number.POSITIVE_INFINITY);
  });

  it("measures notes in seconds and rewinds the cursor", () => {
    const cursor = createCursor();
    drain(LOOP, 0, 3, cursor);
    expect(cursor.cycle).toBeGreaterThan(0);
    resetCursor(cursor);
    expect(cursor).toEqual(createCursor());
    expect(secondsOf(LOOP, LOOP.events[0])).toBe(0.5);
  });
});
