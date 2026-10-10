export interface Pooled {
  active: boolean;
}

export function createPool<T extends Pooled>(
  size: number,
  create: () => T,
): T[] {
  return Array.from({ length: size }, create);
}

export function claim<T extends Pooled>(pool: readonly T[]): T | null {
  for (const item of pool) {
    if (!item.active) {
      item.active = true;
      return item;
    }
  }
  return null;
}

export function clearPool(pool: readonly Pooled[]): void {
  for (const item of pool) {
    item.active = false;
  }
}
