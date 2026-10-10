import { octaveUp } from "./notes";

export type StopName = "flute" | "principal" | "plenum" | "reed" | "pedal";

export type Pitch = string;

export type Sound = Pitch | readonly Pitch[] | null;

export type Note = readonly [sound: Sound, beats: number];

export interface Part {
  stop: StopName;
  velocity: number;
  notes: readonly Note[];
}

export interface Score {
  tempo: number;
  beatsPerBar: number;
  loop: boolean;
  parts: readonly Part[];
}

export function run(beats: number, ...sounds: readonly Sound[]): Note[] {
  return sounds.map((sound) => [sound, beats] as const);
}

export function rhythm(
  sounds: readonly Sound[],
  pattern: readonly number[],
): Note[] {
  return sounds.flatMap((sound) =>
    pattern.map((beats): Note => (beats > 0 ? [sound, beats] : [null, -beats])),
  );
}

export function octaves(
  roots: readonly Pitch[],
  hits: number,
  beats: number,
): Note[] {
  return roots.flatMap((root) =>
    Array.from({ length: hits }, (_, hit): Note => [
      hit % 2 === 0 ? root : octaveUp(root),
      beats,
    ]),
  );
}
