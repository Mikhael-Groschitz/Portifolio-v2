import { describe, expect, it } from "vitest";
import { COLLECTOR } from "../balance";
import { type Box, overlaps } from "../core/collision";
import { TILE, parseLevel } from "../levels/level";
import type { BossSurroundings } from "./boss";
import {
  type Collector,
  createCollector,
  damageCollector,
  isCollectorVulnerable,
  laneBox,
  laneOf,
  resetCollector,
  slashBox,
  updateCollector,
} from "./collector";
import { centerX, createEnemies } from "./enemy";
import { createHero } from "./hero";
import { createParticles } from "./particles";
import { createProjectiles } from "./projectiles";

const ARENA = parseLevel([
  "####################",
  "#                  #",
  "#                  #",
  "#                  #",
  "#                  #",
  "#         B        #",
  "#                  #",
  "#                  #",
  "#S                E#",
  "####################",
]);

function setup(heroColumn = 1) {
  const surroundings: BossSurroundings = {
    room: { level: ARENA, enemies: createEnemies(ARENA) },
    hero: createHero({ column: heroColumn, row: 8 }),
    projectiles: createProjectiles(),
    particles: createParticles(),
    seed: 7,
  };
  const [home] = ARENA.places.collector;
  return { surroundings, boss: createCollector(home, ARENA) };
}

function run(boss: Collector, surroundings: BossSurroundings, frames: number) {
  const events = [];
  for (let frame = 0; frame < frames; frame++) {
    events.push(updateCollector(boss, surroundings));
  }
  return events.filter(Boolean);
}

function fight(heroColumn = 6) {
  const { surroundings, boss } = setup(heroColumn);
  run(boss, surroundings, 1 + COLLECTOR.introFrames);
  return { surroundings, boss };
}

function runUntil(
  boss: Collector,
  surroundings: BossSurroundings,
  state: Collector["state"],
  limit = 2000,
) {
  for (let frame = 0; frame < limit && boss.state !== state; frame++) {
    updateCollector(boss, surroundings);
  }
  expect(boss.state).toBe(state);
}

describe("Garbage Collector", () => {
  it("sleeps until the Admin walks in, then fills its HEAP as it appears", () => {
    const { surroundings, boss } = setup();
    expect(run(boss, surroundings, 30)).toEqual([]);
    expect(boss.state).toBe("dormant");
    expect(isCollectorVulnerable(boss)).toBe(false);
    surroundings.hero.x = boss.trigger;
    expect(run(boss, surroundings, 1)).toEqual(["awake"]);
    run(boss, surroundings, COLLECTOR.introFrames / 2);
    expect(boss.health).toBeGreaterThan(0);
    expect(boss.health).toBeLessThan(COLLECTOR.health);
    expect(isCollectorVulnerable(boss)).toBe(false);
    run(boss, surroundings, COLLECTOR.introFrames / 2);
    expect(boss).toMatchObject({ state: "hover", health: COLLECTOR.health });
    expect(isCollectorVulnerable(boss)).toBe(true);
  });

  it("keeps its distance while it hovers, out of reach of a standing whip", () => {
    const { surroundings, boss } = fight();
    run(boss, surroundings, COLLECTOR.hoverFrames - 2);
    const { hero } = surroundings;
    expect(Math.abs(centerX(boss) - centerX(hero))).toBeGreaterThan(TILE * 2);
    expect(boss.y + boss.height).toBeLessThan(hero.y + 11);
  });

  it("winds up on the ground, slashes low for a moment and climbs back", () => {
    const { surroundings, boss } = fight();
    runUntil(boss, surroundings, "windup");
    const box: Box = { x: 0, y: 0, width: 0, height: 0 };
    expect(slashBox(boss, box)).toBe(false);
    runUntil(boss, surroundings, "slash");
    expect(boss.y + boss.height).toBeGreaterThan(boss.floor - TILE / 2);
    expect(slashBox(boss, box)).toBe(true);
    expect(box.y).toBe(boss.floor - COLLECTOR.slashHeight);
    expect(box.height).toBeLessThan(surroundings.hero.height);
    expect(overlaps(box, surroundings.hero)).toBe(true);
    run(boss, surroundings, COLLECTOR.slashFrames);
    expect(boss.state).toBe("recover");
    expect(slashBox(boss, box)).toBe(false);
    runUntil(boss, surroundings, "hover");
  });

  it("marks the Admin's lane and one more, then sweeps about a second later", () => {
    const { surroundings, boss } = fight(9);
    runUntil(boss, surroundings, "mark");
    const marked = boss.lanes.filter(Boolean).length;
    expect(marked).toBe(COLLECTOR.lanes);
    expect(boss.lanes[laneOf(boss, centerX(surroundings.hero))]).toBe(true);
    expect(COLLECTOR.markFrames).toBeGreaterThanOrEqual(55);
    run(boss, surroundings, COLLECTOR.markFrames);
    expect(boss.state).toBe("sweep");
    const box: Box = { x: 0, y: 0, width: 0, height: 0 };
    laneBox(boss, 0, box);
    expect(box).toMatchObject({ x: boss.left, y: boss.floor - box.height });
    run(boss, surroundings, COLLECTOR.sweepFrames);
    expect(boss.state).toBe("hover");
    expect(boss.lanes.some(Boolean)).toBe(false);
  });

  it("hurries below half of its HEAP and marks three lanes", () => {
    const { surroundings, boss } = fight(9);
    damageCollector(boss, COLLECTOR.health / 2);
    runUntil(boss, surroundings, "mark");
    expect(boss.lanes.filter(Boolean)).toHaveLength(COLLECTOR.hurriedLanes);
    expect(boss.lanes.every(Boolean)).toBe(false);
  });

  it("falls apart at zero and frees memory at the end", () => {
    const { surroundings, boss } = fight();
    damageCollector(boss, 3);
    expect(boss.hurt).toBeGreaterThan(0);
    damageCollector(boss, COLLECTOR.health);
    expect(boss).toMatchObject({ state: "defeat", health: 0 });
    expect(isCollectorVulnerable(boss)).toBe(false);
    expect(run(boss, surroundings, COLLECTOR.defeatFrames)).toEqual(["freed"]);
    expect(boss.state).toBe("gone");
    expect(surroundings.particles.some((spark) => spark.active)).toBe(true);
  });

  it("goes back to sleep when the room resets", () => {
    const { surroundings, boss } = fight();
    run(boss, surroundings, 200);
    resetCollector(boss);
    expect(boss).toMatchObject({ state: "dormant", health: 0, cycle: 0 });
    expect(boss.lanes.some(Boolean)).toBe(false);
  });
});
