import { COLLECTOR, DAMAGE, LEGACY } from "../balance";
import type { Level } from "../levels/level";
import {
  type Collector,
  createCollector,
  damageCollector,
  isCollectorVulnerable,
  resetCollector,
  updateCollector,
} from "./collector";
import type { Enemy } from "./enemy";
import type { Hero } from "./hero";
import {
  type Legacy,
  createLegacy,
  damageLegacy,
  isLegacyVulnerable,
  resetLegacy,
  updateLegacy,
} from "./legacy";
import type { Particle } from "./particles";
import type { Projectile } from "./projectiles";

export type Boss = Collector | Legacy;

export type BossKind = Boss["kind"];

export type BossEvent =
  "awake" | "freed" | "rollback" | "committed" | "landing" | "finished";

export interface BossSurroundings {
  room: { level: Level; enemies: readonly Enemy[] };
  hero: Hero;
  projectiles: readonly Projectile[];
  particles: readonly Particle[];
  seed: number;
}

export const BOSS_HEALTH: Readonly<Record<BossKind, number>> = {
  collector: COLLECTOR.health,
  legacy: LEGACY.health,
};

export function createBoss(level: Level): Boss | null {
  const [collector] = level.places.collector;
  if (collector) {
    return createCollector(collector, level);
  }
  const [throne] = level.places.throne;
  return throne ? createLegacy(throne, level) : null;
}

export function resetBoss(boss: Boss): void {
  if (boss.kind === "collector") {
    resetCollector(boss);
  } else {
    resetLegacy(boss);
  }
}

export function updateBoss(
  boss: Boss,
  surroundings: BossSurroundings,
): BossEvent | null {
  return boss.kind === "collector"
    ? updateCollector(boss, surroundings)
    : updateLegacy(boss, surroundings);
}

export function isVulnerable(boss: Boss): boolean {
  return boss.kind === "collector"
    ? isCollectorVulnerable(boss)
    : isLegacyVulnerable(boss);
}

export function damageBoss(boss: Boss, amount: number): BossEvent | null {
  if (boss.kind === "collector") {
    damageCollector(boss, amount);
    return null;
  }
  return damageLegacy(boss, amount);
}

export function touchDamage(boss: Boss): number {
  if (boss.kind === "collector") {
    return DAMAGE.collector;
  }
  return boss.state === "dive" ? DAMAGE.dive : DAMAGE.legacy;
}

export function isFighting(boss: Boss): boolean {
  return boss.state !== "dormant" && boss.state !== "gone";
}

export function isCleared(boss: Boss): boolean {
  return boss.state === "gone";
}
