import { describe, expect, it } from "vitest";
import { LEGACY } from "../balance";
import { TILE, parseLevel } from "../levels/level";
import type { BossSurroundings } from "./boss";
import { centerX, createEnemies } from "./enemy";
import { createHero } from "./hero";
import {
  CARD_LANES,
  type Legacy,
  MOVES,
  PATCHED_MOVES,
  cardLane,
  cardsPerPerform,
  createLegacy,
  damageLegacy,
  isLegacyVulnerable,
  movesOf,
  resetLegacy,
  updateLegacy,
} from "./legacy";
import { createParticles } from "./particles";
import { countFlying, createProjectiles } from "./projectiles";

const THRONE_ROOM = parseLevel([
  "####################",
  "#                  #",
  "#                  #",
  "#                  #",
  "#                  #",
  "#                  #",
  "#                  #",
  "#                  #",
  "#S    s    s    T  #",
  "####################",
]);

function setup(heroColumn = 4) {
  const surroundings: BossSurroundings = {
    room: { level: THRONE_ROOM, enemies: createEnemies(THRONE_ROOM) },
    hero: createHero({ column: heroColumn, row: 8 }),
    projectiles: createProjectiles(),
    particles: createParticles(),
    seed: 11,
  };
  const [seat] = THRONE_ROOM.places.throne;
  return { surroundings, boss: createLegacy(seat, THRONE_ROOM) };
}

function run(boss: Legacy, surroundings: BossSurroundings, frames: number) {
  const events = [];
  for (let frame = 0; frame < frames; frame++) {
    events.push(updateLegacy(boss, surroundings));
  }
  return events.filter(Boolean);
}

function runUntil(
  boss: Legacy,
  surroundings: BossSurroundings,
  state: Legacy["state"],
  limit = 3000,
) {
  const events = [];
  for (let frame = 0; frame < limit && boss.state !== state; frame++) {
    events.push(updateLegacy(boss, surroundings));
  }
  expect(boss.state).toBe(state);
  return events.filter(Boolean);
}

function onThrone(heroColumn = 4) {
  const { surroundings, boss } = setup(heroColumn);
  run(boss, surroundings, 1 + LEGACY.introFrames);
  expect(boss.state).toBe("throne");
  return { surroundings, boss };
}

describe("The Legacy System", () => {
  it("boots on its throne and fills the UPTIME bar", () => {
    const { surroundings, boss } = setup(1);
    expect(run(boss, surroundings, 20)).toEqual([]);
    expect(boss).toMatchObject({ state: "dormant", seated: true });
    surroundings.hero.x = boss.trigger;
    expect(run(boss, surroundings, 1)).toEqual(["awake"]);
    expect(isLegacyVulnerable(boss)).toBe(false);
    run(boss, surroundings, LEGACY.introFrames);
    expect(boss).toMatchObject({ state: "throne", health: LEGACY.health });
    expect(isLegacyVulnerable(boss)).toBe(true);
    expect(boss.y + boss.height).toBe(boss.floor);
  });

  it("runs PERFORM UNTIL as volleys of punched cards at three heights", () => {
    const { surroundings, boss } = onThrone();
    expect(movesOf(boss)[0]).toBe("perform");
    runUntil(boss, surroundings, "perform");
    let thrown = 0;
    while (boss.state === "perform") {
      updateLegacy(boss, surroundings);
      thrown = Math.max(thrown, boss.thrown);
    }
    expect(thrown).toBe(LEGACY.volleys * LEGACY.cardsPerVolley);
    expect(countFlying(surroundings.projectiles, "card")).toBeGreaterThan(0);
    const heights = new Set(
      Array.from({ length: cardsPerPerform(boss) }, (_, index) =>
        cardLane(index),
      ),
    );
    expect([...heights].sort()).toEqual([...CARD_LANES].sort());
    for (const card of surroundings.projectiles.filter((shot) => shot.active)) {
      expect(card.vx).toBeLessThan(0);
    }
  });

  it("uses GO TO to vanish, appear above the Admin and dive where he stood", () => {
    const { surroundings, boss } = onThrone(6);
    boss.cycle = 1;
    runUntil(boss, surroundings, "vanish");
    expect(isLegacyVulnerable(boss)).toBe(false);
    runUntil(boss, surroundings, "appear");
    expect(boss.seated).toBe(false);
    expect(Math.abs(centerX(boss) - centerX(surroundings.hero))).toBeLessThan(
      2,
    );
    expect(boss.y + boss.height).toBeLessThan(boss.floor - TILE * 4);
    runUntil(boss, surroundings, "aim");
    surroundings.hero.x += 3 * TILE;
    const events = runUntil(boss, surroundings, "recover");
    expect(events).toEqual(["landing"]);
    expect(boss.y + boss.height).toBe(boss.floor);
    expect(
      Math.abs(centerX(boss) - centerX(surroundings.hero)),
    ).toBeGreaterThan(2 * TILE);
    runUntil(boss, surroundings, "throne");
    expect(boss.seated).toBe(true);
  });

  it("uses CALL to summon a Syntax Error, and never more than the free slots", () => {
    const { surroundings, boss } = onThrone();
    const slots = surroundings.room.enemies;
    boss.cycle = 2;
    runUntil(boss, surroundings, "call");
    runUntil(boss, surroundings, "throne");
    expect(slots.filter((enemy) => enemy.alive)).toHaveLength(LEGACY.calls);
    const [far] = slots.filter((enemy) => enemy.alive);
    expect(far.home.column).toBe(
      Math.max(...slots.map((slot) => slot.home.column)),
    );
    for (const slot of slots) {
      slot.alive = true;
    }
    boss.cycle = 2;
    runUntil(boss, surroundings, "perform");
  });

  it("refuses to die: ROLLBACK to half health with a new pattern, then COMMIT", () => {
    const { surroundings, boss } = onThrone();
    expect(damageLegacy(boss, 5)).toBeNull();
    expect(damageLegacy(boss, LEGACY.health)).toBe("rollback");
    expect(boss).toMatchObject({ state: "rollback", health: 0 });
    expect(isLegacyVulnerable(boss)).toBe(false);
    run(boss, surroundings, LEGACY.rollbackFrames / 2);
    expect(boss.health).toBeGreaterThan(0);
    expect(boss.health).toBeLessThan(LEGACY.rollbackHealth);
    run(boss, surroundings, LEGACY.rollbackFrames / 2);
    expect(boss).toMatchObject({
      state: "throne",
      patched: true,
      seated: true,
      health: LEGACY.rollbackHealth,
    });
    expect(movesOf(boss)).toBe(PATCHED_MOVES);
    expect(movesOf(boss)).not.toEqual(MOVES);
    expect(damageLegacy(boss, LEGACY.rollbackHealth)).toBe("committed");
    expect(boss.state).toBe("commit");
    expect(run(boss, surroundings, LEGACY.commitFrames)).toEqual(["finished"]);
    expect(boss.state).toBe("gone");
  });

  it("rewinds back to the throne from wherever it fell", () => {
    const { surroundings, boss } = onThrone(6);
    boss.cycle = 1;
    runUntil(boss, surroundings, "recover");
    const { x } = boss;
    damageLegacy(boss, LEGACY.health);
    run(boss, surroundings, LEGACY.rollbackFrames);
    expect(boss.x).not.toBe(x);
    expect(boss.seated).toBe(true);
  });

  it("throws faster cards, calls two Syntax Errors and dives twice after the hotfix", () => {
    const { surroundings, boss } = onThrone(6);
    damageLegacy(boss, LEGACY.health);
    run(boss, surroundings, LEGACY.rollbackFrames);
    expect(cardsPerPerform(boss)).toBe(
      LEGACY.patchedVolleys * LEGACY.cardsPerVolley,
    );
    let landings = 0;
    for (let frame = 0; frame < 2000 && boss.state !== "perform"; frame++) {
      if (updateLegacy(boss, surroundings) === "landing") {
        landings += 1;
      }
    }
    expect(landings).toBe(LEGACY.patchedDives);
    runUntil(boss, surroundings, "throne");
    runUntil(boss, surroundings, "call");
    runUntil(boss, surroundings, "throne");
    expect(
      surroundings.room.enemies.filter((enemy) => enemy.alive),
    ).toHaveLength(LEGACY.patchedCalls);
  });

  it("starts over, unpatched and asleep, when the room resets", () => {
    const { surroundings, boss } = onThrone();
    damageLegacy(boss, LEGACY.health);
    run(boss, surroundings, LEGACY.rollbackFrames);
    resetLegacy(boss);
    expect(boss).toMatchObject({
      state: "dormant",
      patched: false,
      seated: true,
      health: 0,
    });
  });
});
