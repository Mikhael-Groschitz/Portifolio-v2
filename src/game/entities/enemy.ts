import {
  ENEMY_DYING_FRAMES,
  ENEMY_HURT_FRAMES,
  SYNTAX_ERROR,
  WATCHDOG,
} from "../balance";
import type { Body, Box } from "../core/collision";
import { type Cell, type Level, TILE } from "../levels/level";
import type { Hero } from "./hero";
import type { Projectile } from "./projectiles";

export type EnemyKind = "syntaxError" | "watchdog";

export type EnemyState = "patrol" | "windup" | "drift" | "charge";

export interface Enemy extends Body {
  kind: EnemyKind;
  home: Cell;
  summoned: boolean;
  alive: boolean;
  dying: number;
  health: number;
  facing: 1 | -1;
  knock: 1 | -1;
  state: EnemyState;
  timer: number;
  cooldown: number;
  hurt: number;
  struck: number;
  hitToken: number;
  baseY: number;
  phase: number;
  shots: number;
}

export interface Surroundings {
  room: { level: Level };
  hero: Hero;
  projectiles: readonly Projectile[];
}

export const ENEMY_SIZE: Readonly<
  Record<EnemyKind, { width: number; height: number }>
> = {
  syntaxError: { width: 12, height: 22 },
  watchdog: { width: 14, height: 12 },
};

export const ENEMY_HEALTH: Readonly<Record<EnemyKind, number>> = {
  syntaxError: SYNTAX_ERROR.health,
  watchdog: WATCHDOG.health,
};

export function centerX(box: Box): number {
  return box.x + box.width / 2;
}

export function resetEnemy(enemy: Enemy): void {
  const { width, height } = ENEMY_SIZE[enemy.kind];
  const { column, row } = enemy.home;
  enemy.width = width;
  enemy.height = height;
  enemy.x = column * TILE + (TILE - width) / 2;
  enemy.y =
    enemy.kind === "watchdog"
      ? row * TILE + (TILE - height) / 2
      : (row + 1) * TILE - height;
  enemy.vx = 0;
  enemy.vy = 0;
  enemy.grounded = false;
  enemy.alive = !enemy.summoned;
  enemy.dying = 0;
  enemy.health = ENEMY_HEALTH[enemy.kind];
  enemy.facing = -1;
  enemy.knock = 1;
  enemy.state = enemy.kind === "watchdog" ? "drift" : "patrol";
  enemy.timer = 0;
  enemy.cooldown = 0;
  enemy.hurt = 0;
  enemy.struck = 0;
  enemy.hitToken = 0;
  enemy.baseY = enemy.y;
  enemy.phase = column * 17;
  enemy.shots = 0;
}

function createEnemy(kind: EnemyKind, home: Cell, summoned = false): Enemy {
  const enemy: Enemy = {
    kind,
    home,
    summoned,
    x: 0,
    y: 0,
    width: 0,
    height: 0,
    vx: 0,
    vy: 0,
    grounded: false,
    alive: true,
    dying: 0,
    health: 0,
    facing: -1,
    knock: 1,
    state: "patrol",
    timer: 0,
    cooldown: 0,
    hurt: 0,
    struck: 0,
    hitToken: 0,
    baseY: 0,
    phase: 0,
    shots: 0,
  };
  resetEnemy(enemy);
  return enemy;
}

export function createEnemies(level: Level): Enemy[] {
  return [
    ...level.places.syntaxError.map((home) => createEnemy("syntaxError", home)),
    ...level.places.watchdog.map((home) => createEnemy("watchdog", home)),
    ...level.places.summon.map((home) =>
      createEnemy("syntaxError", home, true),
    ),
  ];
}

export function summon(enemy: Enemy): void {
  resetEnemy(enemy);
  enemy.alive = true;
}

export function isFree(enemy: Enemy): boolean {
  return enemy.summoned && !enemy.alive && enemy.dying === 0;
}

export function damageEnemy(
  enemy: Enemy,
  amount: number,
  fromX: number,
): boolean {
  enemy.health -= amount;
  enemy.hurt = ENEMY_HURT_FRAMES;
  enemy.knock = centerX(enemy) >= fromX ? 1 : -1;
  if (enemy.health <= 0 && enemy.alive) {
    enemy.alive = false;
    enemy.dying = ENEMY_DYING_FRAMES;
  }
  return !enemy.alive;
}
