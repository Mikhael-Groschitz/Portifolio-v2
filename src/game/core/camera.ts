import type { Level } from "../levels/level";
import type { Box } from "./collision";
import { clamp } from "./math";

export const VIEW_WIDTH = 320;
export const VIEW_HEIGHT = 180;

const FEET_FROM_BOTTOM = 28;
const FEET_FROM_TOP = 72;

export interface Camera {
  x: number;
  y: number;
}

export function aimCamera(camera: Camera, level: Level, target: Box): void {
  camera.x = clamp(
    target.x + target.width / 2 - VIEW_WIDTH / 2,
    0,
    level.width - VIEW_WIDTH,
  );
  const feet = target.y + target.height;
  if (feet > camera.y + VIEW_HEIGHT - FEET_FROM_BOTTOM) {
    camera.y = feet - (VIEW_HEIGHT - FEET_FROM_BOTTOM);
  } else if (feet < camera.y + FEET_FROM_TOP) {
    camera.y = feet - FEET_FROM_TOP;
  }
  camera.y = clamp(camera.y, 0, level.height - VIEW_HEIGHT);
}

export function descend(from: number, to: number, progress: number): number {
  const eased = (1 - Math.cos(Math.PI * clamp(progress, 0, 1))) / 2;
  return from + (to - from) * eased;
}
