import type { StopName } from "./score";

export interface Stop {
  harmonics: readonly number[];
  gain: number;
  attack: number;
  release: number;
  vibrato: number;
  lowest: number;
  highest: number;
}

export const STOPS: Readonly<Record<StopName, Stop>> = {
  flute: {
    harmonics: [1, 0.12, 0.04],
    gain: 0.1,
    attack: 0.09,
    release: 0.25,
    vibrato: 4,
    lowest: 40,
    highest: 96,
  },
  principal: {
    harmonics: [1, 0.55, 0.3, 0.25, 0.12, 0.08],
    gain: 0.085,
    attack: 0.07,
    release: 0.22,
    vibrato: 3,
    lowest: 48,
    highest: 96,
  },
  plenum: {
    harmonics: [1, 0.75, 0.55, 0.5, 0.3, 0.28, 0.15, 0.2, 0.1, 0.12],
    gain: 0.07,
    attack: 0.05,
    release: 0.2,
    vibrato: 2,
    lowest: 45,
    highest: 96,
  },
  reed: {
    harmonics: [1, 0.5, 0.75, 0.35, 0.55, 0.25, 0.35, 0.15, 0.2],
    gain: 0.06,
    attack: 0.04,
    release: 0.15,
    vibrato: 2,
    lowest: 48,
    highest: 96,
  },
  pedal: {
    harmonics: [1, 0.35, 0.12, 0.06],
    gain: 0.16,
    attack: 0.12,
    release: 0.3,
    vibrato: 0,
    lowest: 33,
    highest: 60,
  },
};
