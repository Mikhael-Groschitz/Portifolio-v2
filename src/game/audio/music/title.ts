import type { Score } from "../score";

const CHORDS = [
  ["D3", "F3", "A3"],
  ["Bb2", "D3", "F3"],
  ["G3", "Bb3", "D4"],
  ["C#3", "E3", "G3", "Bb3"],
  ["D3", "F3", "A3"],
  ["Eb3", "G3", "Bb3"],
  ["C#3", "E3", "G3", "A3"],
  ["D3", "F3", "A3"],
];

export const TITLE: Score = {
  tempo: 56,
  beatsPerBar: 4,
  loop: true,
  parts: [
    {
      stop: "pedal",
      velocity: 0.8,
      notes: [["D2", 32]],
    },
    {
      stop: "flute",
      velocity: 0.7,
      notes: CHORDS.map((chord) => [chord, 4] as const),
    },
    {
      stop: "principal",
      velocity: 0.55,
      notes: [
        [null, 8],
        ["D5", 3],
        ["Bb4", 1],
        ["Bb4", 2],
        ["G4", 1],
        ["E4", 1],
        ["F4", 3],
        ["A4", 1],
        ["G4", 2],
        ["Bb4", 1],
        ["Eb5", 1],
        ["E5", 2],
        ["C#5", 1],
        ["A4", 1],
        ["D5", 4],
      ],
    },
  ],
};
