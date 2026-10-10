import { describe, expect, it } from "vitest";
import {
  COLLECTOR,
  HURT,
  LEGACY,
  PASSAGE_FRAMES,
  QUERY_ENERGY,
  RAM,
} from "../balance";
import { type Controls, NO_CONTROLS } from "../entities/hero";
import { type Cell, type Level, TILE } from "../levels/level";
import { parseStage } from "../levels/stage";
import {
  INTRO_FRAMES,
  INTRO_RISE,
  STILL_INTRO_FRAMES,
  type World,
  createWorld,
  hudOf,
  introProgress,
  isOpen,
  overload,
  pause,
  resume,
  retry,
  skipAhead,
  skipIntro,
  startIntro,
  step,
} from "./world";

const levels = parseStage();
const [entrance] = levels;

function exitOf(level: Level): Cell {
  if (!level.exit) {
    throw new Error("This room has no exit");
  }
  return level.exit;
}

function run(world: World, frames: number, controls: Partial<Controls> = {}) {
  for (let frame = 0; frame < frames; frame++) {
    step(world, { ...NO_CONTROLS, ...controls });
  }
}

function playing(reducedMotion = false): World {
  const world = createWorld(levels, { reducedMotion });
  startIntro(world);
  skipIntro(world);
  return world;
}

function crash(world: World) {
  while (world.mode === "playing") {
    overload(world);
    run(world, HURT.invulnerableFrames);
  }
}

function walkThroughDoor(world: World) {
  const from = world.room.index;
  skipAhead(world);
  run(world, 1);
  run(world, PASSAGE_FRAMES);
  expect(world.room.index).toBe(from + 1);
}

function enterRoom(world: World, index: number) {
  while (world.room.index < index) {
    const { boss } = world.room;
    if (boss && boss.state !== "gone") {
      boss.state = "gone";
    }
    walkThroughDoor(world);
  }
}

function wakeBoss(world: World) {
  const { boss } = world.room;
  if (!boss) {
    throw new Error("This room has no boss");
  }
  world.hero.x = boss.trigger;
  run(world, 1);
  return boss;
}

describe("opening", () => {
  it("waits on the title screen with the camera up in the sky", () => {
    const world = createWorld(levels, { reducedMotion: false });
    const { x, y } = world.hero;
    run(world, 30, { right: true });
    expect(world.mode).toBe("title");
    expect(world.camera.y).toBe(world.restY - INTRO_RISE);
    expect(world.hero).toMatchObject({ x, y });
    expect(introProgress(world)).toBe(0);
  });

  it("descends from the moon to the gate and hands over the controls", () => {
    const world = createWorld(levels, { reducedMotion: false });
    startIntro(world);
    run(world, INTRO_FRAMES / 2);
    expect(world.mode).toBe("intro");
    expect(world.camera.y).toBeGreaterThan(world.restY - INTRO_RISE);
    expect(world.camera.y).toBeLessThan(world.restY);
    run(world, INTRO_FRAMES / 2);
    expect(world.mode).toBe("playing");
    expect(world.camera.y).toBe(world.restY);
  });

  it("can be skipped with Enter", () => {
    const world = createWorld(levels, { reducedMotion: false });
    startIntro(world);
    run(world, 10);
    skipIntro(world);
    expect(world.mode).toBe("playing");
    expect(world.camera.y).toBe(world.restY);
  });

  it("cuts instead of panning when motion is reduced", () => {
    const world = createWorld(levels, { reducedMotion: true });
    startIntro(world);
    const heights = new Set<number>();
    for (let frame = 0; frame < STILL_INTRO_FRAMES - 1; frame++) {
      run(world, 1);
      heights.add(world.camera.y);
    }
    expect([...heights].sort((a, b) => a - b)).toEqual([
      world.restY - INTRO_RISE,
      world.restY,
    ]);
    run(world, 1);
    expect(world.mode).toBe("playing");
  });

  it("needs at least one room", () => {
    expect(() => createWorld([], { reducedMotion: false })).toThrow(
      "at least one room",
    );
  });
});

describe("playing", () => {
  it("counts the play time only while the game runs", () => {
    const world = createWorld(levels, { reducedMotion: false });
    run(world, 20);
    startIntro(world);
    run(world, 20);
    expect(world.playFrames).toBe(0);
    skipIntro(world);
    run(world, 30);
    pause(world);
    run(world, 30);
    expect(world.playFrames).toBe(30);
  });

  it("freezes everything while paused", () => {
    const world = playing();
    pause(world);
    const { x } = world.hero;
    run(world, 30, { right: true });
    expect(world.mode).toBe("paused");
    expect(world.hero.x).toBe(x);
    resume(world);
    run(world, 30, { right: true });
    expect(world.hero.x).toBeGreaterThan(x);
  });

  it("follows the hero into the castle", () => {
    const world = playing();
    run(world, 400, { right: true });
    expect(world.camera.x).toBeGreaterThan(0);
    expect(world.camera.x).toBeCloseTo(
      world.hero.x + world.hero.width / 2 - 160,
    );
  });

  it("crosses the entrance walking right and goes through the GC door", () => {
    const world = playing();
    const door = exitOf(entrance);
    let hold = 0;
    for (
      let frame = 0;
      frame < 4000 && world.room.index === 0 && world.passage === 0;
      frame++
    ) {
      world.hero.invulnerable = 2;
      const blocked = world.hero.grounded && world.hero.vx === 0 && frame > 0;
      if (blocked && hold === 0) {
        hold = 24;
      }
      step(world, {
        ...NO_CONTROLS,
        right: true,
        jump: hold > 0,
        jumpPressed: hold === 24,
      });
      hold = Math.max(hold - 1, 0);
    }
    expect(world.hero.x).toBeGreaterThanOrEqual(door.column * TILE - TILE);
    expect(world.checkpoint.cell).toEqual(entrance.places.checkpoint.at(-1));
    run(world, PASSAGE_FRAMES);
    expect(world.room.index).toBe(1);
    expect(world.checkpoint).toMatchObject({
      room: 1,
      cell: levels[1].start,
    });
  });

  it("keeps every pool at the same size however long it runs", () => {
    const world = playing();
    const sizes = [
      world.projectiles.length,
      world.particles.length,
      world.drops.length,
    ];
    for (let frame = 0; frame < 3000; frame++) {
      step(world, {
        ...NO_CONTROLS,
        right: frame % 400 < 300,
        left: frame % 400 >= 300,
        attackPressed: frame % 30 === 0,
        subweaponPressed: frame % 45 === 0,
        jumpPressed: frame % 50 === 0,
        jump: frame % 50 < 20,
      });
      if (world.mode === "crash") {
        retry(world);
      }
    }
    expect([
      world.projectiles.length,
      world.particles.length,
      world.drops.length,
    ]).toEqual(sizes);
  });

  it("wakes the enemies near the camera only, also up and down", () => {
    const world = playing();
    enterRoom(world, 2);
    const asleep = world.room.enemies.filter(
      (enemy) => enemy.y < world.camera.y - 2 * TILE * 4,
    );
    expect(asleep.length).toBeGreaterThan(0);
    const before = asleep.map((enemy) => [enemy.x, enemy.y]);
    run(world, 60);
    expect(asleep.map((enemy) => [enemy.x, enemy.y])).toEqual(before);
  });
});

describe("doors and rooms", () => {
  it("fades through the door, enters the next room and saves there", () => {
    const world = playing();
    skipAhead(world);
    run(world, 1);
    expect(world.passage).toBe(PASSAGE_FRAMES);
    run(world, PASSAGE_FRAMES / 2 - 1);
    expect(world.room.index).toBe(0);
    run(world, 1);
    expect(world.room.index).toBe(1);
    expect(world.hero.x).toBe(levels[1].start.column * TILE + 2);
    run(world, PASSAGE_FRAMES / 2);
    expect(world.passage).toBe(0);
    expect(world.checkpoint.room).toBe(1);
  });

  it("keeps a boss door locked until the boss is gone", () => {
    const world = playing();
    enterRoom(world, 1);
    expect(isOpen(world.room)).toBe(false);
    world.hero.x = exitOf(world.room.level).column * TILE + 4;
    run(world, 2);
    expect(world.passage).toBe(0);
    const boss = wakeBoss(world);
    boss.state = "gone";
    expect(isOpen(world.room)).toBe(true);
    walkThroughDoor(world);
  });

  it("climbs from the staircase into the throne room", () => {
    const world = playing();
    enterRoom(world, 3);
    expect(world.room.level.exit).toBeNull();
    expect(world.room.boss?.kind).toBe("legacy");
  });
});

describe("bosses", () => {
  it("shows the boss bar once the fight starts and counts its health", () => {
    const world = playing();
    enterRoom(world, 1);
    expect(hudOf(world).boss).toBeNull();
    wakeBoss(world);
    run(world, COLLECTOR.introFrames);
    expect(hudOf(world).boss).toEqual({
      kind: "collector",
      health: COLLECTOR.health,
    });
    expect(world.noticeFrames).toBeGreaterThan(0);
    expect(world.notice).toBe("collector");
  });

  it("drops the GC item when the Garbage Collector falls", () => {
    const world = playing();
    enterRoom(world, 1);
    wakeBoss(world);
    run(world, COLLECTOR.introFrames + 1);
    skipAhead(world);
    expect(world.room.boss?.state).toBe("defeat");
    run(world, COLLECTOR.defeatFrames);
    expect(world.room.boss?.state).toBe("gone");
    expect(world.drops.some((drop) => drop.active && drop.kind === "gc")).toBe(
      true,
    );
    expect(world.notice).toBe("freed");
    expect(hudOf(world).boss).toBeNull();
  });

  it("restarts the fight from the boss door after a crash", () => {
    const world = playing();
    enterRoom(world, 1);
    const boss = wakeBoss(world);
    run(world, COLLECTOR.introFrames + 1);
    world.hero.energy = 0;
    crash(world);
    expect(world.mode).toBe("crash");
    retry(world);
    expect(world.mode).toBe("playing");
    expect(world.room.index).toBe(1);
    expect(boss.state).toBe("dormant");
    expect(world.hero.ram).toBe(RAM.start);
    expect(world.hero.energy).toBe(QUERY_ENERGY.start);
    expect(world.hero.x).toBe(world.room.level.start.column * TILE + 2);
  });

  it("rolls back once, commits on the second defeat and ends in victory", () => {
    const world = playing();
    enterRoom(world, 3);
    const boss = wakeBoss(world);
    run(world, LEGACY.introFrames + 1);
    skipAhead(world);
    expect(boss.state).toBe("rollback");
    expect(world.notice).toBe("rollback");
    run(world, LEGACY.rollbackFrames);
    expect(boss.health).toBe(LEGACY.rollbackHealth);
    expect(hudOf(world).boss).toEqual({
      kind: "legacy",
      health: LEGACY.rollbackHealth,
    });
    skipAhead(world);
    expect(boss.state).toBe("commit");
    run(world, LEGACY.commitFrames);
    expect(world.mode).toBe("victory");
    const frames = world.playFrames;
    run(world, 30);
    expect(world.playFrames).toBe(frames);
    retry(world);
    expect(world.mode).toBe("victory");
  });
});

describe("RAM and Crash", () => {
  it("raises the RAM with the development shortcut only while playing", () => {
    const title = createWorld(levels, { reducedMotion: false });
    overload(title);
    expect(title.hero.ram).toBe(RAM.start);
    const world = playing();
    overload(world);
    expect(world.hero.ram).toBe(RAM.start + RAM.devOverload);
  });

  it("crashes at 100% and tries again from the last checkpoint", () => {
    const world = playing();
    const [checkpoint] = entrance.places.checkpoint;
    world.hero.x = checkpoint.column * TILE + 8;
    run(world, 2);
    expect(world.checkpoint.cell).toEqual(checkpoint);
    const played = world.playFrames;
    crash(world);
    expect(world.mode).toBe("crash");
    expect(world.hero.ram).toBe(RAM.crash);
    const frozen = world.playFrames;
    run(world, 30, { right: true });
    expect(world.playFrames).toBe(frozen);
    retry(world);
    expect(world.mode).toBe("playing");
    expect(world.hero.ram).toBe(RAM.start);
    expect(world.hero.x).toBe(checkpoint.column * TILE + 2);
    expect(world.playFrames).toBeGreaterThan(played);
  });

  it("only retries after a crash", () => {
    const world = playing();
    world.hero.ram = 70;
    retry(world);
    expect(world.hero.ram).toBe(70);
  });

  it("reports the HUD values", () => {
    const world = playing();
    world.hero.ram = 33.4;
    expect(hudOf(world)).toEqual({
      mode: "playing",
      ram: 33,
      energy: QUERY_ENERGY.start,
      subweapon: "select",
      cloudReady: true,
      notice: null,
      notices: 0,
      boss: null,
      muted: false,
    });
  });
});

describe("retry", () => {
  it("resets enemies, disks and shots but lets the hero keep JOIN", () => {
    const world = playing();
    const [enemy] = world.room.enemies;
    enemy.alive = false;
    world.room.containers[0].broken = true;
    world.hero.subweapons.push("join");
    world.hero.ram = RAM.crash;
    step(world, NO_CONTROLS);
    expect(world.mode).toBe("crash");
    retry(world);
    expect(enemy.alive).toBe(true);
    expect(world.room.containers[0].broken).toBe(false);
    expect(world.projectiles.some((shot) => shot.active)).toBe(false);
    expect(world.hero.subweapons).toEqual(["select", "join"]);
  });
});

describe("skip shortcut", () => {
  it("walks to the door, or finishes the boss in front of the hero", () => {
    const world = playing();
    skipAhead(world);
    expect(world.hero.x).toBe(exitOf(entrance).column * TILE + 2);
    walkThroughDoor(world);
    const boss = world.room.boss;
    skipAhead(world);
    expect(boss?.state).toBe("dormant");
    wakeBoss(world);
    skipAhead(world);
    expect(boss?.state).toBe("intro");
  });
});
