import {
  ENEMY_HURT_FRAMES,
  ENEMY_KNOCKBACK,
  MOVEMENT,
  SYNTAX_ERROR,
} from "../balance";
import { moveBody } from "../core/collision";
import { type Level, TILE, isFloor, isSolid } from "../levels/level";
import { type Enemy, type Surroundings, centerX } from "./enemy";
import type { Hero } from "./hero";
import { PROJECTILE_SIZE, launch } from "./projectiles";

const GLYPH_VARIANTS = 3;

const VERTICAL_SIGHT = 48;

function blockedAhead(enemy: Enemy, level: Level): boolean {
  const front = enemy.facing > 0 ? enemy.x + enemy.width + 1 : enemy.x - 1;
  const column = Math.floor(front / TILE);
  const feet = enemy.y + enemy.height;
  return (
    isSolid(level, column, Math.floor((feet - 1) / TILE)) ||
    !isFloor(level, column, Math.floor((feet + 1) / TILE))
  );
}

function sees(enemy: Enemy, hero: Hero): boolean {
  return (
    Math.abs(centerX(hero) - centerX(enemy)) < SYNTAX_ERROR.sight &&
    Math.abs(hero.y + hero.height - (enemy.y + enemy.height)) < VERTICAL_SIGHT
  );
}

export function throwSpeed(distance: number, drop: number): number {
  const lift = SYNTAX_ERROR.throwLift;
  const gravity = SYNTAX_ERROR.glyphGravity;
  const airtime =
    (lift + Math.sqrt(lift * lift + 2 * gravity * Math.max(drop, 0))) / gravity;
  return Math.min(
    Math.max(Math.abs(distance) / airtime, SYNTAX_ERROR.minThrowSpeed),
    SYNTAX_ERROR.maxThrowSpeed,
  );
}

function throwGlyph(enemy: Enemy, { hero, projectiles }: Surroundings) {
  const { width, height } = PROJECTILE_SIZE.glyph;
  const top = enemy.y - height / 2;
  const drop = hero.y + hero.height - (top + height);
  launch(projectiles, {
    kind: "glyph",
    x: centerX(enemy) - width / 2,
    y: top,
    vx: enemy.facing * throwSpeed(centerX(hero) - centerX(enemy), drop),
    vy: -SYNTAX_ERROR.throwLift,
    facing: enemy.facing,
    variant: enemy.shots % GLYPH_VARIANTS,
    token: 0,
  });
  enemy.shots += 1;
}

function act(enemy: Enemy, surroundings: Surroundings): void {
  const {
    room: { level },
    hero,
  } = surroundings;
  if (enemy.hurt > 0) {
    enemy.vx = (enemy.knock * ENEMY_KNOCKBACK * enemy.hurt) / ENEMY_HURT_FRAMES;
    enemy.hurt -= 1;
    return;
  }
  if (enemy.state === "windup") {
    enemy.vx = 0;
    enemy.timer -= 1;
    if (enemy.timer <= 0) {
      throwGlyph(enemy, surroundings);
      enemy.state = "patrol";
      enemy.cooldown = SYNTAX_ERROR.cooldownFrames;
    }
    return;
  }
  if (enemy.cooldown === 0 && sees(enemy, hero)) {
    enemy.state = "windup";
    enemy.timer = SYNTAX_ERROR.windupFrames;
    enemy.vx = 0;
    enemy.facing = centerX(hero) >= centerX(enemy) ? 1 : -1;
    return;
  }
  if (enemy.grounded && blockedAhead(enemy, level)) {
    enemy.facing = enemy.facing > 0 ? -1 : 1;
  }
  enemy.vx = enemy.facing * SYNTAX_ERROR.walkSpeed;
}

export function updateSyntaxError(
  enemy: Enemy,
  surroundings: Surroundings,
): void {
  enemy.cooldown = Math.max(enemy.cooldown - 1, 0);
  act(enemy, surroundings);
  enemy.vy = Math.min(enemy.vy + MOVEMENT.gravity, MOVEMENT.maxFallSpeed);
  moveBody(surroundings.room.level, enemy);
}
