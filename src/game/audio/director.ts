import type { World } from "../core/world";
import type { Boss } from "../entities/boss";
import { centerX } from "../entities/enemy";
import { TILE } from "../levels/level";
import type { TrackName } from "./tracks";

function bossTrack(boss: Boss): TrackName | null {
  switch (boss.state) {
    case "dormant":
      return boss.kind === "collector" ? "stage" : null;
    case "gone":
      return "stage";
    case "defeat":
    case "commit":
      return null;
    default:
      return "boss";
  }
}

function entranceTrack(world: World, current: TrackName | null): TrackName {
  if (current === "stage") {
    return "stage";
  }
  const [arch] = world.room.level.places.arch;
  const inCorridor = arch && centerX(world.hero) >= (arch.column + 1) * TILE;
  return inCorridor ? "stage" : "title";
}

export function chooseTrack(
  world: World,
  current: TrackName | null,
): TrackName | null {
  switch (world.mode) {
    case "title":
      return null;
    case "intro":
      return "title";
    case "crash":
      return "defeat";
    case "victory":
      return "victory";
    case "paused":
      return current;
    case "playing":
      break;
  }
  if (world.passage > 0) {
    return current;
  }
  const { boss } = world.room;
  if (boss) {
    return bossTrack(boss);
  }
  return world.room.index === 0 ? entranceTrack(world, current) : "stage";
}
