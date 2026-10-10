import { describe, expect, it } from "vitest";
import {
  type World,
  createWorld,
  pause,
  skipIntro,
  startIntro,
} from "../core/world";
import { TILE } from "../levels/level";
import { parseStage } from "../levels/stage";
import { chooseTrack } from "./director";

const levels = parseStage();

function playing(): World {
  const world = createWorld(levels, { reducedMotion: false });
  startIntro(world);
  skipIntro(world);
  return world;
}

function inRoom(index: number): World {
  const world = playing();
  world.room = world.rooms[index];
  return world;
}

describe("music director", () => {
  it("stays silent on the title and plays the title theme over the opening", () => {
    const world = createWorld(levels, { reducedMotion: false });
    expect(chooseTrack(world, null)).toBeNull();
    startIntro(world);
    expect(chooseTrack(world, null)).toBe("title");
  });

  it("keeps the title theme in the Hall and starts the stage in the corridor", () => {
    const world = playing();
    expect(chooseTrack(world, "title")).toBe("title");
    const [arch] = world.room.level.places.arch;
    world.hero.x = (arch.column + 2) * TILE;
    expect(chooseTrack(world, "title")).toBe("stage");
    world.hero.x = 20 * TILE;
    expect(chooseTrack(world, "stage")).toBe("stage");
  });

  it("follows the Garbage Collector fight from start to finish", () => {
    const world = inRoom(1);
    const boss = world.room.boss;
    if (!boss) {
      throw new Error("The room needs a boss");
    }
    expect(chooseTrack(world, "stage")).toBe("stage");
    boss.state = "hover";
    expect(chooseTrack(world, "stage")).toBe("boss");
    boss.state = "defeat";
    expect(chooseTrack(world, "boss")).toBeNull();
    boss.state = "gone";
    expect(chooseTrack(world, null)).toBe("stage");
  });

  it("plays the stage up the staircase and waits in silence before the throne", () => {
    expect(chooseTrack(inRoom(2), "stage")).toBe("stage");
    const throne = inRoom(3);
    const boss = throne.room.boss;
    if (!boss) {
      throw new Error("The room needs a boss");
    }
    expect(chooseTrack(throne, "stage")).toBeNull();
    boss.state = "intro";
    expect(chooseTrack(throne, null)).toBe("boss");
    boss.state = "rollback";
    expect(chooseTrack(throne, "boss")).toBe("boss");
    boss.state = "commit";
    expect(chooseTrack(throne, "boss")).toBeNull();
  });

  it("plays the defeat on a Crash and the victory at the end", () => {
    const world = playing();
    world.mode = "crash";
    expect(chooseTrack(world, "stage")).toBe("defeat");
    world.mode = "victory";
    expect(chooseTrack(world, null)).toBe("victory");
  });

  it("keeps the current track while paused and through a door", () => {
    const world = playing();
    pause(world);
    expect(chooseTrack(world, "boss")).toBe("boss");
    world.mode = "playing";
    world.passage = 10;
    expect(chooseTrack(world, "stage")).toBe("stage");
  });
});
