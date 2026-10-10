import { COLLECTOR_ROOM } from "./collector-room";
import { LOG_CORRIDOR } from "./corridor";
import { HALL_OF_RACKS } from "./hall";
import { type Level, joinSegments, parseLevel } from "./level";
import { STAIRCASE } from "./staircase";
import { THRONE_ROOM } from "./throne-room";

export interface RoomPlan {
  map: readonly string[];
  plaque: string | null;
}

export const ENTRANCE = joinSegments(HALL_OF_RACKS, LOG_CORRIDOR);

export const STAGE: readonly RoomPlan[] = [
  { map: ENTRANCE, plaque: "GC" },
  { map: COLLECTOR_ROOM, plaque: null },
  { map: STAIRCASE, plaque: "PROD" },
  { map: THRONE_ROOM, plaque: null },
];

export function parseStage(stage: readonly RoomPlan[] = STAGE): Level[] {
  return stage.map(({ map, plaque }) => parseLevel(map, plaque));
}
