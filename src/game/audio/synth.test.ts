import { describe, expect, it } from "vitest";
import { CUES } from "../core/cues";
import { EFFECTS } from "./effects";
import { CATHEDRAL, impulse } from "./reverb";
import { STOPS } from "./stops";

function loudness(samples: Float32Array, from: number, to: number): number {
  let sum = 0;
  for (let index = from; index < to; index++) {
    sum += samples[index] ** 2;
  }
  return Math.sqrt(sum / (to - from));
}

describe("organ stops", () => {
  it("build each stop from its fundamental and softer harmonics", () => {
    for (const [name, stop] of Object.entries(STOPS)) {
      expect(stop.harmonics[0], name).toBe(1);
      expect(stop.harmonics.every((level) => level >= 0 && level <= 1)).toBe(
        true,
      );
      expect(stop.gain, name).toBeLessThanOrEqual(0.2);
      expect(stop.attack, name).toBeGreaterThanOrEqual(0.04);
      expect(stop.vibrato, name).toBeLessThanOrEqual(5);
    }
  });

  it("puts the pedal below the manuals", () => {
    expect(STOPS.pedal.lowest).toBeLessThan(STOPS.flute.lowest);
    expect(STOPS.pedal.vibrato).toBe(0);
  });
});

describe("cathedral reverb", () => {
  const rate = 8000;
  const [left, right] = impulse(rate);

  it("lasts as long as a cathedral and starts after a short pre-delay", () => {
    expect(left).toHaveLength(Math.round(rate * CATHEDRAL.seconds));
    expect(
      left
        .slice(0, Math.round(rate * CATHEDRAL.predelay))
        .every((sample) => sample === 0),
    ).toBe(true);
  });

  it("fades out, and the two sides differ for a wide sound", () => {
    const head = loudness(left, rate * 0.1, rate * 0.4);
    const tail = loudness(left, rate * 3, rate * 3.3);
    expect(head).toBeGreaterThan(tail * 50);
    expect(left).not.toEqual(right);
  });

  it("is the same every time", () => {
    expect(impulse(rate)[0]).toEqual(left);
  });
});

describe("sound effects", () => {
  it("has a short, moderate sound for every cue", () => {
    expect(Object.keys(EFFECTS).sort()).toEqual([...CUES].sort());
    for (const [name, layers] of Object.entries(EFFECTS)) {
      expect(layers.length, name).toBeGreaterThan(0);
      for (const layer of layers) {
        expect(layer.duration, name).toBeGreaterThan(0);
        expect((layer.delay ?? 0) + layer.duration, name).toBeLessThanOrEqual(
          1.2,
        );
        expect(layer.gain, name).toBeLessThanOrEqual(0.45);
        for (const frequency of [layer.from, layer.to]) {
          expect(frequency, name).toBeGreaterThanOrEqual(20);
          expect(frequency, name).toBeLessThanOrEqual(12_000);
        }
      }
    }
  });
});
