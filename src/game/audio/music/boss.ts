import { type Note, type Score, octaves, rhythm, run } from "../score";

const D_MINOR = ["D4", "F4", "A4"];
const B_FLAT = ["Bb3", "D4", "F4"];
const C_SHARP_DIMINISHED = ["C#4", "E4", "G4", "Bb4"];
const G_MINOR = ["G3", "Bb3", "D4"];
const E_FLAT = ["Eb4", "G4", "Bb4"];
const A_SEVENTH = ["A3", "C#4", "E4", "G4"];

const STAB = [0.75, -0.25, 0.5, -0.5, 0.75, -0.25, 0.5, -0.5];

const MELODY: Note[] = [
  ...run(0.5, "D5", "F5", "A5", "F5", "D5", "F5", "A5", "D6"),
  ...run(0.5, "F5", "A5", "D6", "A5", "F5", "E5", "F5", "A5"),
  ...run(0.5, "Bb5", "A5", "F5", "D5", "Bb4", "D5", "F5", "A5"),
  ...run(0.5, "G5", "E5", "C#5", "Bb4", "G4", "Bb4", "C#5", "E5"),
  ...run(0.5, "F5", "D5", "A4", "D5", "F5", "G5", "A5", "F5"),
  ...run(0.5, "G5", "Bb5", "D6", "Bb5", "G5", "F5", "D5", "Bb4"),
  ...run(0.5, "Eb5", "G5", "Bb5", "G5", "Eb5", "D5", "Eb5", "G5"),
  ...run(0.5, "A5", "G5", "E5", "C#5", "A4", "C#5", "E5", "G5"),
  ["D5", 1],
  ...run(0.5, "Bb4", "G4"),
  ...run(1, "D5", "G5"),
  ["E5", 1],
  ...run(0.5, "G5", "E5"),
  ...run(1, "Bb5", "G5"),
  ["F5", 1.5],
  ["E5", 0.5],
  ...run(1, "D5", "A4"),
  ["F5", 1.5],
  ["D5", 0.5],
  ...run(1, "Bb4", "F4"),
  ...run(0.5, "G4", "Bb4", "D5", "G5"),
  ...run(1, "Bb5", "G5"),
  ["Bb5", 1],
  ...run(0.5, "G5", "Eb5"),
  ...run(1, "G5", "Bb5"),
  ["C#6", 1],
  ...run(0.5, "A5", "E5"),
  ...run(1, "G5", "E5"),
  ...run(0.5, "C#5", "E5", "G5", "A5"),
  ...run(1, "Bb5", "A5"),
];

const STABS = rhythm(
  [
    D_MINOR,
    D_MINOR,
    B_FLAT,
    C_SHARP_DIMINISHED,
    D_MINOR,
    G_MINOR,
    E_FLAT,
    A_SEVENTH,
    G_MINOR,
    C_SHARP_DIMINISHED,
    D_MINOR,
    B_FLAT,
    G_MINOR,
    E_FLAT,
    A_SEVENTH,
    A_SEVENTH,
  ],
  STAB,
);

const PEDAL = octaves(
  [
    ...["D2", "D2", "D2", "D2", "D2", "D2", "Eb2", "A2"],
    ...["G2", "C#2", "D2", "Bb2", "G2", "Eb2", "A2", "A2"],
  ],
  8,
  0.5,
);

export const BOSS_MUSIC: Score = {
  tempo: 132,
  beatsPerBar: 4,
  loop: true,
  parts: [
    { stop: "reed", velocity: 0.6, notes: MELODY },
    { stop: "plenum", velocity: 0.42, notes: STABS },
    { stop: "pedal", velocity: 0.7, notes: PEDAL },
  ],
};
