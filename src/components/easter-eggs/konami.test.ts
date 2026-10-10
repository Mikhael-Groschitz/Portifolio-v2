import { describe, expect, it } from "vitest";
import { KONAMI_CODE, LETTERS_FROM, nextKonamiStep } from "./konami";

function follow(keys: readonly string[]): number {
  return keys.reduce((step, key) => {
    const next = nextKonamiStep(step, key);
    return next === KONAMI_CODE.length ? 0 : next;
  }, 0);
}

function completes(keys: readonly string[]): boolean {
  let step = 0;
  for (const key of keys) {
    step = nextKonamiStep(step, key);
    if (step === KONAMI_CODE.length) {
      return true;
    }
  }
  return false;
}

describe("Konami code", () => {
  it("recognizes the whole sequence, letters in any case", () => {
    expect(completes(KONAMI_CODE)).toBe(true);
    expect(completes([...KONAMI_CODE.slice(0, LETTERS_FROM), "B", "A"])).toBe(
      true,
    );
  });

  it("starts over on a wrong key", () => {
    expect(
      completes([...KONAMI_CODE.slice(0, 5), "x", ...KONAMI_CODE.slice(5)]),
    ).toBe(false);
    expect(follow(["ArrowUp", "ArrowDown"])).toBe(0);
  });

  it("keeps the start when up is pressed too many times", () => {
    expect(completes(["ArrowUp", ...KONAMI_CODE])).toBe(true);
    expect(completes(["ArrowUp", "ArrowUp", ...KONAMI_CODE])).toBe(true);
    expect(completes(["ArrowDown", "ArrowUp", ...KONAMI_CODE.slice(1)])).toBe(
      true,
    );
  });

  it("recovers when a later step is interrupted by up", () => {
    const interrupted = [...KONAMI_CODE.slice(0, 6), ...KONAMI_CODE];
    expect(completes(interrupted)).toBe(true);
  });
});
