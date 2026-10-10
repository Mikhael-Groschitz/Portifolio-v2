import { LEGACY, SUBWEAPONS, SYNTAX_ERROR, WATCHDOG } from "../balance";
import { type Box, hitsSolid, overlaps } from "../core/collision";
import { type Pooled, claim, createPool } from "../core/pool";
import type { Level } from "../levels/level";

export type ProjectileKind = "select" | "join" | "glyph" | "beam" | "card";

export interface Projectile extends Box, Pooled {
  kind: ProjectileKind;
  vx: number;
  vy: number;
  age: number;
  travelled: number;
  facing: 1 | -1;
  variant: number;
  returning: boolean;
  token: number;
}

export const PROJECTILE_SIZE: Readonly<
  Record<ProjectileKind, { width: number; height: number }>
> = {
  select: { width: 10, height: 4 },
  join: { width: 10, height: 10 },
  glyph: { width: 6, height: 10 },
  beam: { width: 22, height: 6 },
  card: { width: 10, height: 6 },
};

const POOL_SIZE = 24;
const JOIN_LIFETIME = 150;
const JOIN_ARC = 0.08;
const JOIN_HOMING = 0.12;

export function createProjectiles(): Projectile[] {
  return createPool(POOL_SIZE, () => ({
    active: false,
    kind: "select",
    x: 0,
    y: 0,
    width: 0,
    height: 0,
    vx: 0,
    vy: 0,
    age: 0,
    travelled: 0,
    facing: 1,
    variant: 0,
    returning: false,
    token: 0,
  }));
}

export function isHostile(projectile: Projectile): boolean {
  return (
    projectile.kind === "glyph" ||
    projectile.kind === "beam" ||
    projectile.kind === "card"
  );
}

export function isWhippable(projectile: Projectile): boolean {
  return projectile.kind === "glyph" || projectile.kind === "card";
}

export function countFlying(
  projectiles: readonly Projectile[],
  kind: ProjectileKind,
): number {
  let count = 0;
  for (const projectile of projectiles) {
    if (projectile.active && projectile.kind === kind) {
      count += 1;
    }
  }
  return count;
}

export interface Launch {
  kind: ProjectileKind;
  x: number;
  y: number;
  vx: number;
  vy: number;
  facing: 1 | -1;
  variant: number;
  token: number;
}

export function launch(
  projectiles: readonly Projectile[],
  shot: Readonly<Launch>,
): Projectile | null {
  const projectile = claim(projectiles);
  if (!projectile) {
    return null;
  }
  const size = PROJECTILE_SIZE[shot.kind];
  projectile.kind = shot.kind;
  projectile.width = size.width;
  projectile.height = size.height;
  projectile.x = shot.x;
  projectile.y = shot.y;
  projectile.vx = shot.vx;
  projectile.vy = shot.vy;
  projectile.facing = shot.facing;
  projectile.variant = shot.variant;
  projectile.token = shot.token;
  projectile.age = 0;
  projectile.travelled = 0;
  projectile.returning = false;
  return projectile;
}

function flyStraight(projectile: Projectile, level: Level, range: number) {
  projectile.x += projectile.vx;
  projectile.travelled += Math.abs(projectile.vx);
  if (projectile.travelled > range || hitsSolid(level, projectile)) {
    projectile.active = false;
  }
}

function boomerang(projectile: Projectile, home: Box) {
  const { speed, turnFrames } = SUBWEAPONS.join;
  if (!projectile.returning && projectile.age >= turnFrames) {
    projectile.returning = true;
    projectile.token = -projectile.token;
  }
  if (projectile.returning) {
    const targetX = home.x + home.width / 2 - projectile.width / 2;
    const targetY = home.y + home.height / 2 - projectile.height / 2;
    projectile.vx = Math.sign(targetX - projectile.x) * speed;
    projectile.vy = (targetY - projectile.y) * JOIN_HOMING;
  } else {
    projectile.vx =
      projectile.facing * speed * (1 - projectile.age / turnFrames);
    projectile.vy += JOIN_ARC;
  }
  projectile.x += projectile.vx;
  projectile.y += projectile.vy;
  const caught = projectile.returning && overlaps(projectile, home);
  if (caught || projectile.age > JOIN_LIFETIME) {
    projectile.active = false;
  }
}

function arc(projectile: Projectile, level: Level) {
  projectile.x += projectile.vx;
  projectile.y += projectile.vy;
  projectile.vy += SYNTAX_ERROR.glyphGravity;
  if (hitsSolid(level, projectile) || projectile.y > level.height) {
    projectile.active = false;
  }
}

export function moveProjectile(
  projectile: Projectile,
  level: Level,
  home: Box,
): void {
  projectile.age += 1;
  switch (projectile.kind) {
    case "select":
      flyStraight(projectile, level, SUBWEAPONS.select.range);
      break;
    case "beam":
      flyStraight(projectile, level, WATCHDOG.beamRange);
      break;
    case "card":
      flyStraight(projectile, level, LEGACY.cardRange);
      break;
    case "join":
      boomerang(projectile, home);
      break;
    case "glyph":
      arc(projectile, level);
      break;
  }
}
