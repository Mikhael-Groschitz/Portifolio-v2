import { DAMAGE, GC, SUBWEAPONS, WHIP } from "../balance";
import { isVulnerable, touchDamage } from "../entities/boss";
import { type Collector, laneBox, slashBox } from "../entities/collector";
import { type Enemy, centerX, damageEnemy } from "../entities/enemy";
import {
  type Controls,
  type Hero,
  activeSubweapon,
  cycleSubweapon,
  grantSubweapon,
  handY,
  hurtHero,
  lashBox,
  startCast,
} from "../entities/hero";
import {
  type Container,
  applyDrop,
  dropFor,
  spawnDrop,
} from "../entities/items";
import { burst } from "../entities/particles";
import {
  PROJECTILE_SIZE,
  type Projectile,
  countFlying,
  isHostile,
  isWhippable,
  launch,
} from "../entities/projectiles";
import { clearHostileShots, hitBoss } from "./bosses";
import { VIEW_WIDTH } from "./camera";
import { type Box, overlaps } from "./collision";
import { cue } from "./cues";
import { announce } from "./notices";
import { random } from "./random";
import type { World } from "./world";

export const SWEEP_FRAMES = 24;

const LASH: Box = { x: 0, y: 0, width: 0, height: 0 };
const ATTACK: Box = { x: 0, y: 0, width: 0, height: 0 };
const IMPACT_SPARKS = 6;

const SHOT_DAMAGE: Readonly<Record<Projectile["kind"], number>> = {
  select: SUBWEAPONS.select.damage,
  join: SUBWEAPONS.join.damage,
  glyph: DAMAGE.glyph,
  beam: DAMAGE.logBeam,
  card: DAMAGE.card,
};

function breakContainer(world: World, container: Container): void {
  const x = container.x + container.width / 2;
  const y = container.y + container.height / 2;
  container.broken = true;
  cue(world, "break");
  burst(
    world.particles,
    world,
    container.kind === "disk" ? "plastic" : "glass",
    x,
    y,
    10,
  );
  spawnDrop(world.drops, dropFor(container.kind, random(world)), x, y);
}

function hitEnemy(
  world: World,
  enemy: Enemy,
  damage: number,
  fromX: number,
): void {
  const x = centerX(enemy);
  const y = enemy.y + enemy.height / 2;
  burst(world.particles, world, "impact", x, y, IMPACT_SPARKS);
  if (!damageEnemy(enemy, damage, fromX)) {
    cue(world, "hit");
    return;
  }
  cue(world, "smash");
  burst(
    world.particles,
    world,
    enemy.kind === "syntaxError" ? "bone" : "ember",
    x,
    y,
    14,
  );
  if (random(world) < GC.enemyEnergyChance) {
    spawnDrop(world.drops, "energy", x, y);
  }
}

function strikeBoss(world: World): void {
  const { boss } = world.room;
  const { lashes } = world.hero;
  if (
    boss &&
    isVulnerable(boss) &&
    boss.struck !== lashes &&
    overlaps(LASH, boss)
  ) {
    boss.struck = lashes;
    hitBoss(world, boss, WHIP.damage);
  }
}

function strike(world: World): void {
  const { hero, room } = world;
  if (!lashBox(hero, LASH)) {
    return;
  }
  for (const enemy of room.enemies) {
    if (enemy.alive && enemy.struck !== hero.lashes && overlaps(LASH, enemy)) {
      enemy.struck = hero.lashes;
      hitEnemy(world, enemy, WHIP.damage, centerX(hero));
    }
  }
  strikeBoss(world);
  for (const container of room.containers) {
    if (!container.broken && overlaps(LASH, container)) {
      breakContainer(world, container);
    }
  }
  for (const projectile of world.projectiles) {
    if (
      projectile.active &&
      isWhippable(projectile) &&
      overlaps(LASH, projectile)
    ) {
      projectile.active = false;
      burst(world.particles, world, "data", projectile.x, projectile.y, 4);
    }
  }
}

function shootBoss(world: World, projectile: Projectile): boolean {
  const { boss } = world.room;
  if (
    !boss ||
    !isVulnerable(boss) ||
    boss.hitToken === projectile.token ||
    !overlaps(projectile, boss)
  ) {
    return false;
  }
  boss.hitToken = projectile.token;
  hitBoss(world, boss, SHOT_DAMAGE[projectile.kind]);
  return true;
}

function shoot(world: World, projectile: Projectile): void {
  const stops = projectile.kind === "select";
  for (const enemy of world.room.enemies) {
    if (
      enemy.alive &&
      enemy.hitToken !== projectile.token &&
      overlaps(projectile, enemy)
    ) {
      enemy.hitToken = projectile.token;
      hitEnemy(world, enemy, SHOT_DAMAGE[projectile.kind], centerX(projectile));
      if (stops) {
        projectile.active = false;
        return;
      }
    }
  }
  if (shootBoss(world, projectile) && stops) {
    projectile.active = false;
    return;
  }
  for (const container of world.room.containers) {
    if (!container.broken && overlaps(projectile, container)) {
      breakContainer(world, container);
      if (stops) {
        projectile.active = false;
        return;
      }
    }
  }
}

function hurt(world: World, amount: number, fromX: number): void {
  if (hurtHero(world.hero, amount, fromX)) {
    cue(world, "hurt");
  }
}

function inSweptLane(boss: Collector, hero: Hero): boolean {
  if (boss.state !== "sweep") {
    return false;
  }
  for (let lane = 0; lane < boss.lanes.length; lane++) {
    laneBox(boss, lane, ATTACK);
    if (boss.lanes[lane] && overlaps(hero, ATTACK)) {
      return true;
    }
  }
  return false;
}

function harmByBoss(world: World): void {
  const { hero } = world;
  const { boss } = world.room;
  if (!boss) {
    return;
  }
  if (isVulnerable(boss) && overlaps(hero, boss)) {
    hurt(world, touchDamage(boss), centerX(boss));
  } else if (
    boss.kind === "collector" &&
    slashBox(boss, ATTACK) &&
    overlaps(hero, ATTACK)
  ) {
    hurt(world, DAMAGE.deleteSlash, centerX(boss));
  } else if (boss.kind === "collector" && inSweptLane(boss, hero)) {
    hurt(world, DAMAGE.markSweep, centerX(ATTACK));
  }
}

function harm(world: World): void {
  const { hero } = world;
  if (hero.invulnerable > 0) {
    return;
  }
  for (const enemy of world.room.enemies) {
    if (enemy.alive && overlaps(hero, enemy)) {
      const damage =
        enemy.kind === "syntaxError" ? DAMAGE.syntaxError : DAMAGE.watchdog;
      hurt(world, damage, centerX(enemy));
      return;
    }
  }
  for (const projectile of world.projectiles) {
    if (
      projectile.active &&
      isHostile(projectile) &&
      overlaps(hero, projectile)
    ) {
      projectile.active = false;
      hurt(world, SHOT_DAMAGE[projectile.kind], centerX(projectile));
      return;
    }
  }
  harmByBoss(world);
}

function gather(world: World): void {
  const { hero } = world;
  for (const drop of world.drops) {
    if (drop.active && overlaps(hero, drop)) {
      applyDrop(hero, drop.kind);
      drop.active = false;
      cue(world, drop.kind === "gc" ? "relief" : "collect");
    }
  }
  for (const relic of world.room.relics) {
    if (!relic.taken && overlaps(hero, relic)) {
      relic.taken = true;
      grantSubweapon(hero, relic.kind);
      announce(world, relic.kind);
      cue(world, "relic");
    }
  }
}

export function resolveCombat(world: World): void {
  strike(world);
  for (const projectile of world.projectiles) {
    if (projectile.active && !isHostile(projectile)) {
      shoot(world, projectile);
    }
  }
  harm(world);
  gather(world);
}

function onScreen(world: World, box: Box): boolean {
  const left = world.camera.x;
  return box.x + box.width > left && box.x < left + VIEW_WIDTH;
}

function truncate(world: World): void {
  clearHostileShots(world);
  const damage = SUBWEAPONS.truncate.damage;
  for (const enemy of world.room.enemies) {
    if (enemy.alive && onScreen(world, enemy)) {
      hitEnemy(world, enemy, damage, centerX(world.hero));
    }
  }
  const { boss } = world.room;
  if (boss && isVulnerable(boss) && onScreen(world, boss)) {
    hitBoss(world, boss, damage);
  }
  world.sweep = SWEEP_FRAMES;
}

function throwFromHand(world: World, kind: "select" | "join"): void {
  const { hero } = world;
  const { width, height } = PROJECTILE_SIZE[kind];
  world.tokens += 1;
  launch(world.projectiles, {
    kind,
    x: hero.facing > 0 ? hero.x + hero.width : hero.x - width,
    y: handY(hero) - height / 2,
    vx: hero.facing * SUBWEAPONS[kind].speed,
    vy: kind === "join" ? -SUBWEAPONS.join.lift : 0,
    facing: hero.facing,
    variant: 0,
    token: world.tokens,
  });
}

function inFlight(world: World, kind: keyof typeof SUBWEAPONS): number {
  return kind === "truncate"
    ? Number(world.sweep > 0)
    : countFlying(world.projectiles, kind);
}

export function fireSubweapon(world: World, controls: Controls): void {
  const { hero } = world;
  if (controls.switchPressed && cycleSubweapon(hero)) {
    announce(world, "switch");
  }
  if (
    !controls.subweaponPressed ||
    hero.stun > 0 ||
    hero.cloud > 0 ||
    hero.lash >= 0
  ) {
    return;
  }
  const kind = activeSubweapon(hero);
  const { cost, limit } = SUBWEAPONS[kind];
  if (hero.energy < cost || inFlight(world, kind) >= limit) {
    return;
  }
  hero.energy -= cost;
  startCast(hero);
  cue(world, kind);
  if (kind === "truncate") {
    truncate(world);
  } else {
    throwFromHand(world, kind);
  }
}
