import { describe, expect, it } from "vitest";
import { BEACON, HERO_BLINK_FRAMES, LED, heroAlpha, lit } from "./flicker";

const SECOND = 60;

function flashesPerSecond(states: readonly unknown[]): number {
  const changes = states.filter(
    (state, frame) => frame > 0 && state !== states[frame - 1],
  ).length;
  return changes / 2 / (states.length / SECOND);
}

describe("flicker", () => {
  it("blinks the server LEDs and the antenna beacons slowly", () => {
    for (const light of [LED, BEACON]) {
      const states = Array.from({ length: SECOND * 10 }, (_, frame) =>
        lit(frame, 0, light),
      );
      expect(flashesPerSecond(states)).toBeLessThan(1);
    }
  });

  it("blinks the Admin under three times a second while invulnerable", () => {
    const states = Array.from({ length: SECOND * 2 }, (_, frame) =>
      heroAlpha(SECOND * 2 - frame, false),
    );
    expect(flashesPerSecond(states)).toBeLessThanOrEqual(3);
    expect(HERO_BLINK_FRAMES).toBeGreaterThanOrEqual(SECOND / 6);
  });

  it("keeps the Admin steady and dimmed with reduced motion, and solid when safe", () => {
    const states = Array.from({ length: SECOND }, (_, frame) =>
      heroAlpha(SECOND - frame, true),
    );
    expect(new Set(states).size).toBe(1);
    expect(states[0]).toBeLessThan(1);
    expect(heroAlpha(0, false)).toBe(1);
  });
});
