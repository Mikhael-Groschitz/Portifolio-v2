export const LED = { period: 150, duty: 0.7 } as const;
export const BEACON = { period: 120, duty: 0.5 } as const;
export const HERO_BLINK_FRAMES = 12;

const DIMMED = 0.35;
const STILL = 0.6;

export function lit(
  frame: number,
  phase: number,
  { period, duty }: Readonly<{ period: number; duty: number }>,
): boolean {
  return (frame + phase) % period < period * duty;
}

export function heroAlpha(
  invulnerable: number,
  reducedMotion: boolean,
): number {
  if (invulnerable === 0) {
    return 1;
  }
  if (reducedMotion) {
    return STILL;
  }
  return Math.floor(invulnerable / HERO_BLINK_FRAMES) % 2 === 0 ? 1 : DIMMED;
}
