import { GC, MOVEMENT, QUERY_ENERGY } from "../balance";
import { type Body, type Box, moveBody } from "../core/collision";
import { type Pooled, claim, createPool } from "../core/pool";
import { type Cell, type Level, TILE } from "../levels/level";
import type { Hero, Subweapon } from "./hero";

export type ContainerKind = "disk" | "pen";
export type DropKind = "energy" | "bigEnergy" | "gc";
export type RelicKind = Exclude<Subweapon, "select">;

export interface Container extends Box {
  kind: ContainerKind;
  broken: boolean;
}

export interface Drop extends Body, Pooled {
  kind: DropKind;
}

export interface Relic extends Box {
  kind: RelicKind;
  taken: boolean;
}

const CONTAINER_SIZE = 14;
const RELIC_SIZE = 14;
const POOL_SIZE = 12;
const POP_SPEED = 2.4;

const DROP_SIZE: Readonly<Record<DropKind, number>> = {
  energy: 8,
  bigEnergy: 10,
  gc: 10,
};

function centered(cell: Cell, size: number): Box {
  return {
    x: cell.column * TILE + (TILE - size) / 2,
    y: cell.row * TILE + (TILE - size) / 2,
    width: size,
    height: size,
  };
}

export function createContainers(level: Level): Container[] {
  return [
    ...level.places.disk.map((cell) => ({
      ...centered(cell, CONTAINER_SIZE),
      kind: "disk" as const,
      broken: false,
    })),
    ...level.places.pen.map((cell) => ({
      ...centered(cell, CONTAINER_SIZE),
      kind: "pen" as const,
      broken: false,
    })),
  ];
}

export function createRelics(level: Level): Relic[] {
  return [
    ...level.places.join.map((cell) => ({
      ...centered(cell, RELIC_SIZE),
      kind: "join" as const,
      taken: false,
    })),
    ...level.places.truncate.map((cell) => ({
      ...centered(cell, RELIC_SIZE),
      kind: "truncate" as const,
      taken: false,
    })),
  ];
}

export function createDrops(): Drop[] {
  return createPool(POOL_SIZE, () => ({
    active: false,
    kind: "energy",
    x: 0,
    y: 0,
    width: 0,
    height: 0,
    vx: 0,
    vy: 0,
    grounded: false,
  }));
}

export function dropFor(kind: ContainerKind, roll: number): DropKind {
  const chance = kind === "disk" ? GC.diskChance : GC.penChance;
  if (roll < chance) {
    return "gc";
  }
  return kind === "disk" ? "energy" : "bigEnergy";
}

export function spawnDrop(
  drops: readonly Drop[],
  kind: DropKind,
  centerX: number,
  centerY: number,
): void {
  const drop = claim(drops);
  if (!drop) {
    return;
  }
  const size = DROP_SIZE[kind];
  drop.kind = kind;
  drop.width = size;
  drop.height = size;
  drop.x = centerX - size / 2;
  drop.y = centerY - size / 2;
  drop.vx = 0;
  drop.vy = -POP_SPEED;
  drop.grounded = false;
}

export function updateDrops(drops: readonly Drop[], level: Level): void {
  for (const drop of drops) {
    if (drop.active && !drop.grounded) {
      drop.vy = Math.min(drop.vy + MOVEMENT.gravity, MOVEMENT.maxFallSpeed);
      moveBody(level, drop);
      if (drop.y > level.height) {
        drop.active = false;
      }
    }
  }
}

export function applyDrop(hero: Hero, kind: DropKind): void {
  if (kind === "gc") {
    hero.ram = Math.max(hero.ram - GC.relief, 0);
    return;
  }
  const gain = kind === "energy" ? QUERY_ENERGY.small : QUERY_ENERGY.large;
  hero.energy = Math.min(hero.energy + gain, QUERY_ENERGY.max);
}
