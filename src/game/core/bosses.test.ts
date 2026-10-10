import { describe, expect, it } from "vitest";
import {
  COLLECTOR,
  DAMAGE,
  LEGACY,
  QUAKE_FRAMES,
  RAM,
  SUBWEAPONS,
  WHIP,
} from "../balance";
import type { Boss } from "../entities/boss";
import { type Collector, laneOf } from "../entities/collector";
import { centerX } from "../entities/enemy";
import {
  type Controls,
  LASH_FRAMES,
  NO_CONTROLS,
  grantSubweapon,
} from "../entities/hero";
import type { Legacy } from "../entities/legacy";
import { launch } from "../entities/projectiles";
import { TILE } from "../levels/level";
import { parseStage } from "../levels/stage";
import { type World, createWorld, skipIntro, startIntro, step } from "./world";

const levels = parseStage();

function arena(index: 1 | 3, reducedMotion = false): World {
  const world = createWorld([levels[index]], { reducedMotion, seed: 5 });
  startIntro(world);
  skipIntro(world);
  return world;
}

function run(world: World, frames: number, controls: Partial<Controls> = {}) {
  for (let frame = 0; frame < frames; frame++) {
    step(world, { ...NO_CONTROLS, ...controls });
  }
}

function lash(world: World) {
  run(world, 1, { attackPressed: true });
  run(world, LASH_FRAMES - 1);
}

function awaken<T extends Boss>(world: World, frames: number): T {
  const boss = world.room.boss as T;
  world.hero.x = boss.trigger;
  run(world, 1 + frames);
  return boss;
}

function standBeside(world: World, boss: Boss) {
  world.hero.x = boss.x - world.hero.width - 6;
  world.hero.y = boss.floor - world.hero.height;
  world.hero.facing = 1;
}

describe("hitting a boss", () => {
  it("lands one whip per lash, and only while the boss can be hit", () => {
    const world = arena(1);
    const boss = awaken<Collector>(world, 0);
    boss.y = boss.floor - boss.height - 2;
    standBeside(world, boss);
    lash(world);
    expect(boss.state).toBe("intro");
    expect(boss.hurt).toBe(0);
    run(world, COLLECTOR.introFrames);
    boss.state = "recover";
    boss.timer = 1000;
    boss.y = boss.floor - boss.height - 2;
    standBeside(world, boss);
    world.hero.invulnerable = 1000;
    run(world, 1, { attackPressed: true });
    run(world, WHIP.windupFrames + 1);
    expect(boss.health).toBe(COLLECTOR.health - 1);
    expect(boss.hurt).toBeGreaterThan(0);
    expect(world.particles.some((spark) => spark.active)).toBe(true);
    run(world, LASH_FRAMES);
    expect(boss.health).toBe(COLLECTOR.health - 1);
  });

  it("stops SELECT at the boss and lets TRUNCATE reach it on screen", () => {
    const world = arena(3);
    grantSubweapon(world.hero, "truncate");
    world.hero.energy = 99;
    const boss = awaken<Legacy>(world, LEGACY.introFrames);
    boss.timer = 10_000;
    const health = boss.health;
    world.hero.invulnerable = 10_000;
    run(world, 1, { subweaponPressed: true });
    expect(boss.health).toBe(health - SUBWEAPONS.truncate.damage);
    world.hero.subweapon = 0;
    world.hero.facing = 1;
    run(world, 20);
    run(world, 1, { subweaponPressed: true });
    run(world, 80);
    expect(boss.health).toBe(
      health - SUBWEAPONS.truncate.damage - SUBWEAPONS.select.damage,
    );
    expect(world.projectiles.some((shot) => shot.active)).toBe(false);
  });
});

describe("boss attacks", () => {
  it("hurts with the DELETE slash low in front, and a jump clears it", () => {
    const grounded = arena(1);
    const boss = awaken<Collector>(grounded, COLLECTOR.introFrames);
    boss.state = "slash";
    boss.timer = COLLECTOR.slashFrames;
    boss.facing = -1;
    boss.x = grounded.hero.x + grounded.hero.width + 10;
    boss.y = boss.floor - boss.height - 2;
    run(grounded, 1);
    expect(grounded.hero.ram).toBe(RAM.start + DAMAGE.deleteSlash);

    const airborne = arena(1);
    const flying = awaken<Collector>(airborne, COLLECTOR.introFrames);
    airborne.hero.y =
      flying.floor - COLLECTOR.slashHeight - airborne.hero.height - 4;
    airborne.hero.grounded = false;
    airborne.hero.vy = -1;
    flying.state = "slash";
    flying.timer = COLLECTOR.slashFrames;
    flying.facing = -1;
    flying.x = airborne.hero.x + airborne.hero.width + 10;
    flying.y = flying.floor - flying.height - 2;
    run(airborne, 1);
    expect(airborne.hero.ram).toBe(RAM.start);
  });

  it("sweeps only the marked lanes", () => {
    const world = arena(1);
    const boss = awaken<Collector>(world, COLLECTOR.introFrames);
    boss.state = "sweep";
    boss.timer = COLLECTOR.sweepFrames;
    boss.y = 2 * TILE;
    boss.baseY = boss.y;
    const lane = laneOf(boss, centerX(world.hero));
    boss.lanes.fill(false);
    boss.lanes[(lane + 2) % boss.lanes.length] = true;
    run(world, 2);
    expect(world.hero.ram).toBe(RAM.start);
    boss.lanes[lane] = true;
    run(world, 1);
    expect(world.hero.ram).toBe(RAM.start + DAMAGE.markSweep);
  });

  it("throws punched cards that the whip can knock down", () => {
    const world = arena(3);
    awaken<Legacy>(world, 0);
    const { hero } = world;
    launch(world.projectiles, {
      kind: "card",
      x: hero.x + hero.width + 20,
      y: hero.y + 11 - 3,
      vx: -1,
      vy: 0,
      facing: -1,
      variant: 0,
      token: 0,
    });
    hero.facing = 1;
    run(world, 1, { attackPressed: true });
    run(world, 15);
    expect(world.projectiles.some((shot) => shot.active)).toBe(false);
    expect(hero.ram).toBe(RAM.start);
  });

  it("shakes the floor when the dive lands", () => {
    const world = arena(3);
    const boss = awaken<Legacy>(world, LEGACY.introFrames);
    boss.state = "dive";
    boss.seated = false;
    boss.vy = 0;
    boss.x = 12 * TILE;
    boss.y = boss.floor - boss.height - 6;
    while (boss.state === "dive") {
      run(world, 1);
    }
    expect(boss.state).toBe("recover");
    expect(world.quake).toBe(QUAKE_FRAMES - 1);
  });
});

const REACH = 36;

function chase(world: World, frames: number): number {
  for (let frame = 0; frame < frames; frame++) {
    const boss = world.room.boss;
    if (!boss || boss.state === "gone" || world.mode !== "playing") {
      return frame;
    }
    const { hero } = world;
    hero.invulnerable = 2;
    const gap = centerX(boss) - centerX(hero);
    const close = Math.abs(gap) < REACH;
    const above = boss.y + boss.height < hero.y + 4;
    step(world, {
      ...NO_CONTROLS,
      right: gap > REACH - 8,
      left: gap < 8 - REACH,
      jump: close && above,
      jumpPressed: close && above && hero.grounded,
      attackPressed: close && hero.lash < 0,
    });
  }
  return frames;
}

describe("fights", () => {
  it("a whipping Admin beats the Garbage Collector in under a minute", () => {
    const world = arena(1);
    awaken<Collector>(world, 0);
    const frames = chase(world, 60 * 60);
    expect(world.room.boss?.state).toBe("gone");
    expect(frames).toBeLessThan(60 * 60);
  });

  it("a whipping Admin beats the Legacy System, rollback included, in under two minutes", () => {
    const world = arena(3);
    awaken<Legacy>(world, 0);
    const frames = chase(world, 120 * 60);
    expect(world.mode).toBe("victory");
    expect(frames).toBeLessThan(120 * 60);
  });
});
