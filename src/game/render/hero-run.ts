import { TRANSPARENT } from "../palette";
import type { SpriteRows } from "./sprite";

type Point = readonly [x: number, y: number];

interface LegPose {
  knee: Point;
  foot: Point;
}

const LEG_POSES = {
  contact: { knee: [3, 4], foot: [5, 9] },
  push: { knee: [-2, 4], foot: [-6, 8] },
  support: { knee: [2, 4], foot: [0, 8] },
  kick: { knee: [-1, 4], foot: [-6, 5] },
  upright: { knee: [1, 4], foot: [0, 9] },
  tuck: { knee: [3, 3], foot: [-1, 6] },
  drive: { knee: [-1, 5], foot: [-3, 10] },
  reach: { knee: [4, 3], foot: [5, 7] },
} satisfies Record<string, LegPose>;

const ARM_SWINGS = {
  back: { elbow: [-2, 4], hand: [-3, 6] },
  backward: { elbow: [-1, 4], hand: [-1, 6] },
  middle: { elbow: [0, 4], hand: [1, 6] },
  forward: { elbow: [1, 4], hand: [3, 5] },
  front: { elbow: [2, 3], hand: [4, 3] },
} satisfies Record<string, { elbow: Point; hand: Point }>;

interface RunPose {
  near: keyof typeof LEG_POSES;
  far: keyof typeof LEG_POSES;
  bob: number;
  arm: keyof typeof ARM_SWINGS;
}

const RUN_CYCLE: readonly RunPose[] = [
  { near: "contact", far: "push", bob: 0, arm: "back" },
  { near: "support", far: "kick", bob: 1, arm: "backward" },
  { near: "upright", far: "tuck", bob: 0, arm: "middle" },
  { near: "drive", far: "reach", bob: -1, arm: "forward" },
  { near: "push", far: "contact", bob: 0, arm: "front" },
  { near: "kick", far: "support", bob: 1, arm: "forward" },
  { near: "tuck", far: "upright", bob: 0, arm: "middle" },
  { near: "reach", far: "drive", bob: -1, arm: "backward" },
];

const WIDTH = 24;
const HEIGHT = 32;
const LEAN = 1;
const NEAR_HIP: Point = [13, 22];
const FAR_HIP: Point = [11, 22];
const SHOULDER: Point = [13, 15];
const CAPE_TOP = 14;
const CAPE_ROWS = 11;
const CAPE_SPREAD = 7;
const CAPE_WAVE = 1.2;
const CODE_LINES = ["b", "s", "g", "v", "b"];

type Grid = string[][];

function paint(grid: Grid, x: number, y: number, key: string): void {
  if (x >= 0 && y >= 0 && x < WIDTH && y < HEIGHT) {
    grid[y][x] = key;
  }
}

function dab(grid: Grid, x: number, y: number, key: string, edge = key): void {
  paint(grid, x, y, key);
  paint(grid, x + 1, y, edge);
  paint(grid, x, y + 1, key);
  paint(grid, x + 1, y + 1, edge);
}

function stroke(
  grid: Grid,
  from: Point,
  to: Point,
  key: string,
  edge = key,
): void {
  const steps = Math.max(Math.abs(to[0] - from[0]), Math.abs(to[1] - from[1]));
  for (let step = 0; step <= steps; step++) {
    const progress = steps === 0 ? 0 : step / steps;
    dab(
      grid,
      Math.round(from[0] + (to[0] - from[0]) * progress),
      Math.round(from[1] + (to[1] - from[1]) * progress),
      key,
      edge,
    );
  }
}

function place(grid: Grid, part: SpriteRows, left: number, top: number) {
  part.forEach((row, y) => {
    [...row].forEach((key, x) => {
      if (key !== TRANSPARENT) {
        paint(grid, left + x, top + y, key);
      }
    });
  });
}

interface Trousers {
  key: string;
  edge: string;
  toe: string;
}

const NEAR_LEG: Trousers = { key: "2", edge: "3", toe: "3" };
const FAR_LEG: Trousers = { key: "1", edge: "2", toe: "1" };

function leg(grid: Grid, hip: Point, pose: LegPose, trousers: Trousers) {
  const knee: Point = [hip[0] + pose.knee[0], hip[1] + pose.knee[1]];
  const foot: Point = [hip[0] + pose.foot[0], hip[1] + pose.foot[1]];
  stroke(grid, hip, knee, trousers.key, trousers.edge);
  stroke(grid, knee, [foot[0], foot[1] - 3], trousers.key, trousers.edge);
  for (let x = 0; x < 3; x++) {
    paint(grid, foot[0] + x, foot[1] - 1, "1");
  }
  for (let x = 0; x < 3; x++) {
    paint(grid, foot[0] + x, foot[1], "1");
  }
  paint(grid, foot[0] + 3, foot[1], trousers.toe);
}

function arm(grid: Grid, shoulder: Point, swing: keyof typeof ARM_SWINGS) {
  const { elbow, hand } = ARM_SWINGS[swing];
  const joint: Point = [shoulder[0] + elbow[0], shoulder[1] + elbow[1]];
  const grip: Point = [shoulder[0] + hand[0], shoulder[1] + hand[1]];
  stroke(grid, shoulder, joint, "6");
  stroke(grid, joint, grip, "7");
  dab(grid, grip[0], grip[1], "f");
  paint(grid, grip[0] - 1, grip[1] + 2, "c");
  paint(grid, grip[0], grip[1] + 3, "c");
  paint(grid, grip[0] + 1, grip[1] + 3, "c");
  paint(grid, grip[0] + 2, grip[1] + 2, "c");
}

function cape(grid: Grid, top: number, right: number, phase: number): void {
  let left = right;
  for (let row = 0; row < CAPE_ROWS; row++) {
    const wave = Math.round(Math.sin(row * 0.9 - phase) * CAPE_WAVE);
    left = right - Math.min(3 + Math.floor(row * 0.8), CAPE_SPREAD) - wave;
    const hem = row >= CAPE_ROWS - 2;
    for (let x = left; x <= right; x++) {
      const lining = hem && (x - left + row) % 2 === 0;
      paint(grid, x, top + row, lining ? "r" : "n");
    }
    const code = CODE_LINES[(row >> 1) % CODE_LINES.length];
    if (!hem && row % 2 === 0 && right - left >= 4) {
      paint(grid, left + 1, top + row, code);
      paint(grid, left + 2, top + row, code);
    }
  }
  for (let x = left + 1; x < right - 1; x += 3) {
    paint(grid, x, top + CAPE_ROWS, "c");
    paint(grid, x, top + CAPE_ROWS + 1, "y");
  }
}

function runFrame(
  pose: RunPose,
  index: number,
  head: SpriteRows,
  torso: SpriteRows,
): string[] {
  const grid: Grid = Array.from({ length: HEIGHT }, () =>
    Array<string>(WIDTH).fill(TRANSPARENT),
  );
  const { bob } = pose;
  cape(grid, CAPE_TOP + bob, 9 + LEAN, (index * Math.PI) / 4);
  leg(grid, [FAR_HIP[0], FAR_HIP[1] + bob], LEG_POSES[pose.far], FAR_LEG);
  place(grid, torso, 9 + LEAN, 14 + bob);
  leg(grid, [NEAR_HIP[0], NEAR_HIP[1] + bob], LEG_POSES[pose.near], NEAR_LEG);
  place(grid, head, 9 + LEAN, 5 + bob);
  arm(grid, [SHOULDER[0] + LEAN, SHOULDER[1] + bob], pose.arm);
  return grid.map((row) => row.join(""));
}

export const RUN_STEPS = RUN_CYCLE.length;

export function runFrames(head: SpriteRows, torso: SpriteRows): string[][] {
  return RUN_CYCLE.map((pose, index) => runFrame(pose, index, head, torso));
}
