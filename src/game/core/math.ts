export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

export function approach(value: number, target: number, speed: number): number {
  return value + clamp(target - value, -speed, speed);
}
