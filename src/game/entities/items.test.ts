import { describe, expect, it } from "vitest";
import { GC, QUERY_ENERGY } from "../balance";
import { TILE, parseLevel } from "../levels/level";
import { createHero } from "./hero";
import {
  applyDrop,
  createContainers,
  createDrops,
  createRelics,
  dropFor,
  spawnDrop,
  updateDrops,
} from "./items";

const ROOM = parseLevel([
  "####################",
  "#    f    u   j  t #",
  "#                  #",
  "#                  #",
  "#S                E#",
  "####################",
]);

describe("items", () => {
  it("floats disks, pen drives and relics in the middle of their cells", () => {
    const containers = createContainers(ROOM);
    expect(containers.map(({ kind }) => kind)).toEqual(["disk", "pen"]);
    expect(containers[0]).toMatchObject({
      x: 5 * TILE + 1,
      y: TILE + 1,
      width: 14,
      height: 14,
      broken: false,
    });
    expect(createRelics(ROOM).map(({ kind }) => kind)).toEqual([
      "join",
      "truncate",
    ]);
  });

  it("drops energy most of the time and the GC item sometimes", () => {
    expect(dropFor("disk", GC.diskChance - 0.01)).toBe("gc");
    expect(dropFor("disk", GC.diskChance + 0.01)).toBe("energy");
    expect(dropFor("pen", GC.penChance - 0.01)).toBe("gc");
    expect(dropFor("pen", GC.penChance + 0.01)).toBe("bigEnergy");
  });

  it("pops drops up and lets them rest on the floor", () => {
    const drops = createDrops();
    spawnDrop(drops, "energy", 5 * TILE, 2 * TILE);
    const [drop] = drops;
    expect(drop).toMatchObject({ active: true, kind: "energy" });
    updateDrops(drops, ROOM);
    expect(drop.y).toBeLessThan(2 * TILE - drop.height / 2);
    for (let frame = 0; frame < 60; frame++) {
      updateDrops(drops, ROOM);
    }
    expect(drop).toMatchObject({ grounded: true, y: 5 * TILE - drop.height });
  });

  it("refills Query Energy up to the cap and frees RAM down to zero", () => {
    const hero = createHero(ROOM.start);
    hero.energy = QUERY_ENERGY.max - 1;
    applyDrop(hero, "energy");
    expect(hero.energy).toBe(QUERY_ENERGY.max);
    hero.energy = 0;
    applyDrop(hero, "bigEnergy");
    expect(hero.energy).toBe(QUERY_ENERGY.large);
    hero.ram = 60;
    applyDrop(hero, "gc");
    expect(hero.ram).toBe(60 - GC.relief);
    hero.ram = 10;
    applyDrop(hero, "gc");
    expect(hero.ram).toBe(0);
  });
});
