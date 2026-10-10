import { textRows } from "./font";
import {
  type Point,
  type Raster,
  line,
  place,
  plot,
  raster,
  rect,
  rowsOf,
} from "./raster";
import { type SpriteRows, mirror, outline, rotate, stamp } from "./sprite";

export const COLLECTOR_FRAME = { width: 66, height: 54, left: 9, top: 12 };

const CENTER = 20;
const CLOAK_TOP = 16;
const HEM_TOP = 40;
const HEM_BOTTOM = 48;

const LID = [
  "......8888......",
  "......8kk8......",
  "...6788888876...",
  ".67788888888776.",
  "6666666666666666",
  ".nkkkkkkkkkkkkn.",
  ".nkkEEkkkkEEkkn.",
  "nnkkkkkkkkkkkknn",
  "nndkkkkkkkkkkdnn",
];

const RIBS = "678767876786";
const LABEL = textRows("DEL", "k");
const KEY = { width: 15, height: 9 } as const;
const HOOK = { center: [15, 15] as Point, outer: 15, inner: 10 } as const;

function inBlade(x: number, y: number): boolean {
  if (x >= 0 && y >= 0 && x < KEY.width && y < KEY.height) {
    return true;
  }
  const dx = x - HOOK.center[0];
  const dy = y - HOOK.center[1];
  if (dx < 0 || dy > 0) {
    return false;
  }
  const turn = Math.atan2(dx, -dy) / (Math.PI / 2);
  const inner = HOOK.inner + (HOOK.outer - HOOK.inner - 1) * turn;
  const distance = Math.hypot(dx, dy);
  return distance <= HOOK.outer && distance >= inner;
}

function bladeShape(): string[] {
  const width = HOOK.center[0] + HOOK.outer + 1;
  const height = HOOK.center[1] + 1;
  return Array.from({ length: height }, (_, y) =>
    Array.from({ length: width }, (_, x) => {
      if (!inBlade(x, y)) {
        return ".";
      }
      const edge =
        !inBlade(x - 1, y) ||
        !inBlade(x + 1, y) ||
        !inBlade(x, y - 1) ||
        !inBlade(x, y + 1);
      return edge ? "q" : "w";
    }).join(""),
  );
}

const BLADE = bladeShape();
const LABEL_AT: Point = [2, 2];

interface BladeLayout {
  rows: SpriteRows;
  label: SpriteRows;
  labelAt: Point;
}

const BLADES: Readonly<Record<"forward" | "back" | "down", BladeLayout>> = {
  forward: { rows: BLADE, label: LABEL, labelAt: LABEL_AT },
  back: {
    rows: mirror(BLADE),
    label: LABEL,
    labelAt: [BLADE[0].length - LABEL_AT[0] - LABEL[0].length, LABEL_AT[1]],
  },
  down: {
    rows: rotate(BLADE),
    label: rotate(LABEL),
    labelAt: [BLADE.length - LABEL_AT[1] - LABEL.length, LABEL_AT[0]],
  },
};

type Eyes = "red" | "gold" | "squint";

interface CollectorPose {
  lift: number;
  sway: number;
  hand: Point;
  handle: readonly [Point, Point];
  blade: keyof typeof BLADES;
  bladeAt: Point;
  eyes: Eyes;
  reach?: Point;
}

const EYE_KEYS: Readonly<Record<Eyes, string>> = {
  red: "R",
  gold: "y",
  squint: "k",
};

function cloakKey(x: number, left: number): string {
  if (x === left) {
    return "h";
  }
  return x % 4 === 0 ? "d" : "n";
}

function drape(target: Raster, y: number, lift: number, sway: number): void {
  const spread = 8 + Math.floor((y - CLOAK_TOP) / 6);
  const left = CENTER - spread + (y > 32 ? sway : 0);
  for (let x = left; x < left + spread * 2; x++) {
    plot(target, x, y + lift, cloakKey(x, left));
  }
}

function hem(target: Raster, lift: number, sway: number): void {
  for (let x = CENTER - 12 + sway; x < CENTER + 12 + sway; x++) {
    const bottom = Math.min(
      HEM_TOP + 3 + ((x * 7 + sway * 3 + 20) % 5),
      HEM_BOTTOM,
    );
    for (let y = HEM_TOP; y < bottom; y++) {
      plot(target, x, y + lift, (x + y) % 3 === 0 ? "d" : "n");
    }
  }
}

function cloak(target: Raster, lift: number, sway: number): void {
  for (let y = CLOAK_TOP; y < HEM_TOP; y++) {
    drape(target, y, lift, sway);
  }
  hem(target, lift, sway);
}

function canKey(x: number, y: number): string {
  if (y === 19) {
    return "8";
  }
  return y >= 36 ? "6" : RIBS[x];
}

function can(target: Raster, lift: number): void {
  for (let y = 19; y <= 38; y++) {
    for (let x = 0; x < RIBS.length; x++) {
      plot(target, CENTER - 6 + x, y + lift, canKey(x, y));
    }
  }
  rect(target, CENTER - 3, 26 + lift, 6, 4, "6");
  rect(target, CENTER - 2, 27 + lift, 4, 2, "g");
}

function head(target: Raster, lift: number, eyes: Eyes): void {
  place(
    target,
    LID.map((row) => row.replaceAll("E", EYE_KEYS[eyes])),
    CENTER - 8,
    10 + lift,
  );
}

function scythe(target: Raster, pose: CollectorPose): void {
  const [from, to] = pose.handle;
  line(target, from, to, "4", 2);
  line(target, from, to, "5");
  place(target, BLADES[pose.blade].rows, pose.bladeAt[0], pose.bladeAt[1]);
}

function limb(target: Raster, from: Point, hand: Point): void {
  line(target, from, hand, "d", 2);
  rect(target, hand[0], hand[1], 3, 3, "6");
}

function body(pose: CollectorPose): string[] {
  const target = raster(COLLECTOR_FRAME.width, COLLECTOR_FRAME.height);
  if (pose.reach) {
    limb(target, [CENTER - 6, 20 + pose.lift], pose.reach);
  }
  cloak(target, pose.lift, pose.sway);
  can(target, pose.lift);
  head(target, pose.lift, pose.eyes);
  scythe(target, pose);
  limb(target, [CENTER + 6, 20 + pose.lift], pose.hand);
  return outline(rowsOf(target));
}

function labelled(pose: CollectorPose): readonly [string[], string[]] {
  const rows = body(pose);
  const { label, labelAt } = BLADES[pose.blade];
  const x = pose.bladeAt[0] + labelAt[0];
  const y = pose.bladeAt[1] + labelAt[1];
  const mirrored = COLLECTOR_FRAME.width - x - label[0].length;
  return [stamp(rows, label, x, y), stamp(mirror(rows), label, mirrored, y)];
}

const POSES = {
  float1: {
    lift: 0,
    sway: 0,
    hand: [32, 26],
    handle: [
      [34, 8],
      [34, 50],
    ],
    blade: "forward",
    bladeAt: [35, 6],
    eyes: "red",
  },
  float2: {
    lift: 1,
    sway: 1,
    hand: [32, 27],
    handle: [
      [34, 9],
      [34, 50],
    ],
    blade: "forward",
    bladeAt: [35, 7],
    eyes: "red",
  },
  raise: {
    lift: 0,
    sway: -1,
    hand: [28, 14],
    handle: [
      [31, 2],
      [31, 42],
    ],
    blade: "back",
    bladeAt: [1, 0],
    eyes: "gold",
    reach: [8, 12],
  },
  slash: {
    lift: 2,
    sway: -2,
    hand: [31, 32],
    handle: [
      [18, 33],
      [48, 36],
    ],
    blade: "down",
    bladeAt: [47, 22],
    eyes: "gold",
  },
  recover: {
    lift: 3,
    sway: 1,
    hand: [30, 31],
    handle: [
      [24, 24],
      [42, 47],
    ],
    blade: "down",
    bladeAt: [41, 23],
    eyes: "red",
  },
  mark: {
    lift: 0,
    sway: 0,
    hand: [30, 12],
    handle: [
      [33, 2],
      [33, 38],
    ],
    blade: "forward",
    bladeAt: [34, 0],
    eyes: "gold",
    reach: [7, 10],
  },
  hurt: {
    lift: 1,
    sway: 2,
    hand: [31, 28],
    handle: [
      [32, 10],
      [36, 50],
    ],
    blade: "forward",
    bladeAt: [33, 8],
    eyes: "squint",
  },
} satisfies Record<string, CollectorPose>;

export type CollectorPoseName = keyof typeof POSES;

export const COLLECTOR_ART = Object.fromEntries(
  Object.entries<CollectorPose>(POSES).map(([name, pose]) => [
    name,
    labelled(pose),
  ]),
) as Record<CollectorPoseName, readonly [string[], string[]]>;

export const CRUMBLE_FLOOR = COLLECTOR_FRAME.height - 3;

function heap(spread: number, height: number, lidOnTop: boolean): string[] {
  const target = raster(COLLECTOR_FRAME.width, COLLECTOR_FRAME.height);
  const floor = CRUMBLE_FLOOR - 1;
  for (let row = 0; row < height; row++) {
    const half = spread - row * 2;
    for (let x = CENTER - half; x <= CENTER + half; x++) {
      plot(target, x, floor - row, (x + row) % 4 === 0 ? "d" : "n");
    }
  }
  line(target, [CENTER - 14, floor + 1], [CENTER + 18, floor - 1], "5");
  const bladeTop = floor - BLADE.length + 2;
  place(target, BLADE, CENTER + 18, bladeTop);
  place(
    target,
    LID.slice(0, 5),
    lidOnTop ? CENTER - 8 : CENTER - 24,
    lidOnTop ? floor - height - 4 : floor - 4,
  );
  return stamp(
    outline(rowsOf(target)),
    LABEL,
    CENTER + 18 + LABEL_AT[0],
    bladeTop + LABEL_AT[1],
  );
}

export const COLLECTOR_CRUMBLE = [
  heap(12, 12, true),
  heap(14, 7, true),
  heap(15, 4, false),
] as const;

function arc(): string[] {
  const width = 56;
  const height = 22;
  const target = raster(width, height);
  for (let x = 0; x < width; x++) {
    const progress = x / (width - 1);
    const y = Math.round(
      height - 4 - Math.sin(progress * Math.PI) * (height - 6),
    );
    const thickness = 1 + Math.round(Math.sin(progress * Math.PI) * 2);
    for (let dy = 0; dy <= thickness; dy++) {
      plot(target, x, y + dy, dy === 0 ? "y" : "w");
    }
  }
  return rowsOf(target);
}

export const SLASH_ARC = arc();
