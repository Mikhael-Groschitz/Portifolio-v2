import { describe, expect, it } from "vitest";
import { DAMAGE, RAM, SUBWEAPONS, WHIP } from "../balance";
import {
  type Controls,
  LASH_FRAMES,
  NO_CONTROLS,
  grantSubweapon,
  handY,
} from "../entities/hero";
import { launch } from "../entities/projectiles";
import { headLine } from "../entities/watchdog";
import { TILE, parseLevel } from "../levels/level";
import { SWEEP_FRAMES } from "./combat";
import {
  type World,
  createWorld,
  hudOf,
  skipIntro,
  startIntro,
  step,
} from "./world";

function arena(floorRow: string, extra: Record<number, string> = {}): World {
  const rows = [
    "##############################",
    ...Array.from(
      { length: 5 },
      (_, index) => extra[index + 1] ?? "#                            #",
    ),
    floorRow,
    "##############################",
  ];
  const world = createWorld([parseLevel(rows)], {
    reducedMotion: false,
    seed: 3,
  });
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

const EMPTY = "#S                          E#";

describe("whip", () => {
  it("breaks a floppy disk and the hero picks up what falls out", () => {
    const world = arena(EMPTY, { 5: "#  f                         #" });
    const before = { energy: world.hero.energy, ram: world.hero.ram };
    lash(world);
    expect(world.room.containers[0].broken).toBe(true);
    expect(world.drops.filter((drop) => drop.active)).toHaveLength(1);
    run(world, 60);
    run(world, 40, { right: true });
    expect(world.drops.some((drop) => drop.active)).toBe(false);
    const gained = world.hero.energy > before.energy;
    const freed = world.hero.ram < before.ram;
    expect(gained || freed).toBe(true);
  });

  it("needs two lashes for a Syntax Error and each lash counts once", () => {
    const world = arena("#S x                        E#");
    const [enemy] = world.room.enemies;
    enemy.cooldown = 10_000;
    lash(world);
    expect(enemy.health).toBe(1);
    lash(world);
    expect(enemy.alive).toBe(false);
    expect(world.particles.some((particle) => particle.active)).toBe(true);
  });

  it("pushes an enemy back and throws sparks on the first hit", () => {
    const world = arena("#S x                        E#");
    const [enemy] = world.room.enemies;
    enemy.cooldown = 10_000;
    run(world, 1, { attackPressed: true });
    let x = enemy.x;
    while (enemy.hurt === 0 && world.hero.lash >= 0) {
      x = enemy.x;
      run(world, 1);
    }
    expect(enemy.health).toBe(1);
    expect(
      world.particles.some(
        (particle) => particle.active && particle.spark === "impact",
      ),
    ).toBe(true);
    run(world, 6);
    expect(enemy.x).toBeGreaterThan(x);
  });

  it("knocks glyphs out of the air", () => {
    const world = arena(EMPTY);
    run(world, 1, { attackPressed: true });
    run(world, WHIP.windupFrames);
    const glyph = launch(world.projectiles, {
      kind: "glyph",
      x: world.hero.x + 20,
      y: handY(world.hero) - 5,
      vx: 0,
      vy: 0,
      facing: -1,
      variant: 0,
      token: 0,
    });
    run(world, 1);
    expect(glyph?.active).toBe(false);
  });
});

describe("subweapons", () => {
  it("spends Query Energy on SELECT and stops at the first enemy", () => {
    const world = arena("#S          x               E#");
    const [enemy] = world.room.enemies;
    const energy = world.hero.energy;
    run(world, 1, { subweaponPressed: true });
    expect(world.hero.energy).toBe(energy - SUBWEAPONS.select.cost);
    expect(world.projectiles.filter((shot) => shot.active)).toHaveLength(1);
    run(world, 60);
    expect(enemy.health).toBe(1);
    expect(
      world.projectiles.some((shot) => shot.kind === "select" && shot.active),
    ).toBe(false);
  });

  it("respects the energy and the number of shots in the air", () => {
    const world = arena(EMPTY);
    world.hero.energy = 1;
    run(world, 1, { subweaponPressed: true });
    run(world, 1, { subweaponPressed: true });
    expect(world.hero.energy).toBe(0);
    expect(world.projectiles.filter((shot) => shot.active)).toHaveLength(1);
    world.hero.energy = 9;
    run(world, 1, { subweaponPressed: true });
    run(world, 1, { subweaponPressed: true });
    expect(world.projectiles.filter((shot) => shot.active)).toHaveLength(
      SUBWEAPONS.select.limit,
    );
    expect(world.hero.energy).toBe(8);
  });

  it("sends JOIN out and back, hitting on both passes", () => {
    const world = arena("#S   x                      E#");
    const [enemy] = world.room.enemies;
    enemy.cooldown = 10_000;
    grantSubweapon(world.hero, "join");
    const energy = world.hero.energy;
    run(world, 1, { subweaponPressed: true });
    expect(world.hero.energy).toBe(energy - SUBWEAPONS.join.cost);
    run(world, 90);
    expect(enemy.alive).toBe(false);
    expect(
      world.projectiles.some((shot) => shot.kind === "join" && shot.active),
    ).toBe(false);
  });

  it("uses TRUNCATE to clear enemy shots and hit everything on screen", () => {
    const world = arena("#S       x                  E#", {
      2: "#         o                  #",
    });
    grantSubweapon(world.hero, "truncate");
    world.hero.energy = SUBWEAPONS.truncate.cost;
    const glyph = launch(world.projectiles, {
      kind: "glyph",
      x: 12 * TILE,
      y: 2 * TILE,
      vx: 0,
      vy: 0,
      facing: -1,
      variant: 1,
      token: 0,
    });
    run(world, 1, { subweaponPressed: true });
    expect(world.hero.energy).toBe(0);
    expect(glyph?.active).toBe(false);
    expect(world.room.enemies.every((enemy) => !enemy.alive)).toBe(true);
    expect(world.sweep).toBe(SWEEP_FRAMES - 1);
  });

  it("switches with C and says which one is active", () => {
    const world = arena(EMPTY);
    grantSubweapon(world.hero, "join");
    run(world, 1, { switchPressed: true });
    expect(hudOf(world)).toMatchObject({
      subweapon: "select",
      notice: "switch",
      notices: 1,
    });
  });
});

describe("damage", () => {
  it("raises the RAM when an enemy touches the hero", () => {
    const world = arena("#S   x                      E#");
    const [enemy] = world.room.enemies;
    enemy.x = world.hero.x + 4;
    run(world, 1);
    expect(world.hero.ram).toBe(RAM.start + DAMAGE.syntaxError);
    expect(world.hero.invulnerable).toBeGreaterThan(0);
  });

  it("costs less RAM when a glyph lands than when an enemy touches", () => {
    const world = arena(EMPTY);
    launch(world.projectiles, {
      kind: "glyph",
      x: world.hero.x,
      y: world.hero.y + 4,
      vx: 0,
      vy: 0,
      facing: -1,
      variant: 0,
      token: 0,
    });
    run(world, 1);
    expect(world.hero.ram).toBe(RAM.start + DAMAGE.glyph);
    expect(DAMAGE.glyph).toBeLessThan(DAMAGE.syntaxError);
  });

  it("lets a log beam fly over a crouching hero", () => {
    for (const crouching of [true, false]) {
      const world = arena(EMPTY);
      run(world, 1, { down: crouching });
      launch(world.projectiles, {
        kind: "beam",
        x: world.hero.x + 60,
        y: headLine(world.hero) - 3,
        vx: -2.2,
        vy: 0,
        facing: -1,
        variant: 0,
        token: 0,
      });
      run(world, 40, { down: crouching });
      expect(world.hero.ram).toBe(
        crouching ? RAM.start : RAM.start + DAMAGE.logBeam,
      );
    }
  });
});

describe("relics", () => {
  it("equip the subweapon and announce it", () => {
    const world = arena("#S j                        E#");
    run(world, 30, { right: true });
    expect(world.hero.subweapons).toEqual(["select", "join"]);
    expect(hudOf(world)).toMatchObject({
      subweapon: "join",
      notice: "join",
      notices: 1,
    });
    expect(world.room.relics[0].taken).toBe(true);
  });
});
