import type { Score } from "../score";

export const DEFEAT_MUSIC: Score = {
  tempo: 80,
  beatsPerBar: 4,
  loop: false,
  parts: [
    {
      stop: "plenum",
      velocity: 0.7,
      notes: [
        [["A2", "D3", "F3", "A3"], 3],
        [null, 1],
      ],
    },
    {
      stop: "pedal",
      velocity: 0.9,
      notes: [
        ["D2", 3],
        [null, 1],
      ],
    },
  ],
};

export const VICTORY_MUSIC: Score = {
  tempo: 76,
  beatsPerBar: 4,
  loop: false,
  parts: [
    {
      stop: "plenum",
      velocity: 0.6,
      notes: [
        ["D5", 1],
        ["Bb4", 1],
        ["E5", 1],
        ["G5", 1],
        ["A5", 1],
        ["G5", 0.5],
        ["E5", 0.5],
        ["F#5", 6],
      ],
    },
    {
      stop: "principal",
      velocity: 0.55,
      notes: [
        [["G3", "Bb3", "D4"], 2],
        [["C#4", "E4", "G4", "Bb4"], 2],
        [["A3", "C#4", "E4", "G4"], 2],
        [["D4", "F#4", "A4"], 2],
        [["D4", "F#4", "A4", "D5"], 4],
      ],
    },
    {
      stop: "pedal",
      velocity: 0.85,
      notes: [
        ["G2", 2],
        ["A2", 2],
        ["A2", 2],
        ["D2", 6],
      ],
    },
  ],
};
