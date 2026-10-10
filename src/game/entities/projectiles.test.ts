import { describe, expect, it } from "vitest";
import { SUBWEAPONS, WATCHDOG } from "../balance";
import { TILE, parseLevel } from "../levels/level";
import {
  type Launch,
  countFlying,
  createProjectiles,
  isHostile,
  launch,
  moveProjectile,
} from "./projectiles";

const ROOM = parseLevel([
  "##############################",
  "#                            #",
  "#                            #",
  "#                            #",
  "#                            #",
  "#                            #",
  "#S                          E#",
  "##############################",
]);

const FAR = { x: 0, y: 0, width: 1, height: 1 };

function shot(overrides: Partial<Launch>): Launch {
  return {
    kind: "select",
    x: 3 * TILE,
    y: 3 * TILE,
    vx: 0,
    vy: 0,
    facing: 1,
    variant: 0,
    token: 1,
    ...overrides,
  };
}

describe("projectiles", () => {
  it("fly SELECT straight until a wall or the end of its range", () => {
    const projectiles = createProjectiles();
    const select = launch(projectiles, shot({ vx: SUBWEAPONS.select.speed }));
    expect(select).not.toBeNull();
    const y = select?.y;
    let frames = 0;
    while (select?.active && frames < 200) {
      moveProjectile(select, ROOM, FAR);
      frames += 1;
    }
    expect(select?.y).toBe(y);
    expect(select?.x).toBeGreaterThanOrEqual(
      3 * TILE + SUBWEAPONS.select.range,
    );
    expect(frames).toBeLessThan(
      SUBWEAPONS.select.range / SUBWEAPONS.select.speed + 2,
    );
    const wall = launch(projectiles, shot({ vx: -SUBWEAPONS.select.speed }));
    while (wall?.active) {
      moveProjectile(wall, ROOM, FAR);
    }
    expect(wall?.x).toBeLessThan(TILE);
  });

  it("drop glyphs in an arc until they hit the floor", () => {
    const projectiles = createProjectiles();
    const glyph = launch(
      projectiles,
      shot({ kind: "glyph", vx: 1, vy: -2.8, y: 5 * TILE }),
    );
    let highest = glyph?.y ?? 0;
    while (glyph?.active) {
      moveProjectile(glyph, ROOM, FAR);
      highest = Math.min(highest, glyph.y);
    }
    expect(highest).toBeLessThan(4 * TILE);
    expect((glyph?.y ?? 0) + (glyph?.height ?? 0)).toBeGreaterThan(7 * TILE);
  });

  it("bring JOIN back to the hand that threw it", () => {
    const projectiles = createProjectiles();
    const hand = { x: 3 * TILE, y: 3 * TILE, width: 12, height: 28 };
    const join = launch(
      projectiles,
      shot({
        kind: "join",
        vx: SUBWEAPONS.join.speed,
        vy: -SUBWEAPONS.join.lift,
        x: hand.x + hand.width,
        token: 7,
      }),
    );
    let farthest = 0;
    let frames = 0;
    while (join?.active && frames < 200) {
      moveProjectile(join, ROOM, hand);
      farthest = Math.max(farthest, join.x);
      frames += 1;
    }
    expect(farthest).toBeGreaterThan(hand.x + 3 * TILE);
    expect(join?.returning).toBe(true);
    expect(join?.token).toBe(-7);
    expect(frames).toBeLessThan(120);
  });

  it("send log beams across the room", () => {
    const projectiles = createProjectiles();
    const beam = launch(
      projectiles,
      shot({ kind: "beam", vx: -WATCHDOG.beamSpeed, x: 20 * TILE }),
    );
    expect(beam && isHostile(beam)).toBe(true);
    for (let frame = 0; frame < 20; frame++) {
      if (beam) {
        moveProjectile(beam, ROOM, FAR);
      }
    }
    expect(beam?.x).toBeCloseTo(20 * TILE - 20 * WATCHDOG.beamSpeed);
  });

  it("reuse a fixed pool and refuse shots when it is full", () => {
    const projectiles = createProjectiles();
    const size = projectiles.length;
    for (let index = 0; index < size; index++) {
      expect(launch(projectiles, shot({}))).not.toBeNull();
    }
    expect(launch(projectiles, shot({}))).toBeNull();
    expect(projectiles).toHaveLength(size);
    expect(countFlying(projectiles, "select")).toBe(size);
    expect(countFlying(projectiles, "join")).toBe(0);
  });
});
