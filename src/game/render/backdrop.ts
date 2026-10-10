import { VIEW_WIDTH } from "../core/camera";

export interface Layer {
  left: number;
  top: number;
  depthX: number;
  depthY: number;
  repeat: boolean;
}

export const SKY_LAYER: Layer = {
  left: 0,
  top: -97,
  depthX: 0,
  depthY: 0.4,
  repeat: true,
};

export const MOON_LAYER: Layer = {
  left: 268,
  top: -38,
  depthX: 0.05,
  depthY: 0.3,
  repeat: false,
};

export const TOWER_LAYER: Layer = {
  left: 0,
  top: 34,
  depthX: 0.3,
  depthY: 0.5,
  repeat: true,
};

export const FOG_LAYER: Layer = {
  left: 0,
  top: 125,
  depthX: 0.6,
  depthY: 0.6,
  repeat: true,
};

export const FOG_DRIFT = 0.15;

const SKY_HEIGHT = 280;
const TOWERS_HEIGHT = 120;
const FOG_HEIGHT = 22;
const MOON_SIZE = 34;

interface Tower {
  x: number;
  width: number;
  height: number;
  roof: "spire" | "battlement" | "flat";
  mast: number;
  dish: boolean;
}

const TOWERS: readonly Tower[] = [
  { x: 6, width: 18, height: 70, roof: "spire", mast: 0, dish: false },
  { x: 30, width: 26, height: 52, roof: "battlement", mast: 18, dish: false },
  { x: 64, width: 14, height: 88, roof: "spire", mast: 0, dish: false },
  { x: 86, width: 30, height: 60, roof: "flat", mast: 0, dish: true },
  { x: 124, width: 20, height: 96, roof: "spire", mast: 0, dish: false },
  { x: 150, width: 34, height: 46, roof: "battlement", mast: 24, dish: false },
  { x: 192, width: 16, height: 78, roof: "spire", mast: 0, dish: false },
  { x: 214, width: 28, height: 58, roof: "flat", mast: 30, dish: false },
  { x: 250, width: 22, height: 84, roof: "spire", mast: 0, dish: false },
  { x: 280, width: 32, height: 50, roof: "battlement", mast: 0, dish: true },
];

function hash(x: number, y: number): number {
  const value = Math.imul(x * 73856093 + y * 19349663, 83492791);
  return (value ^ (value >>> 13)) >>> 0;
}

function grid(
  width: number,
  height: number,
  paint: (x: number, y: number) => string,
): string[] {
  return Array.from({ length: height }, (_, y) =>
    Array.from({ length: width }, (_, x) => paint(x, y)).join(""),
  );
}

const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];

const SKY_BANDS = [
  { until: 0.55, from: "n", to: "n" },
  { until: 0.72, from: "n", to: "d" },
  { until: 0.86, from: "d", to: "d" },
  { until: 1, from: "d", to: "h" },
];

function skyPaint(x: number, y: number): string {
  const level = y / SKY_HEIGHT;
  if (level < 0.5) {
    const roll = hash(x, y) % 260;
    if (roll === 0) {
      return "w";
    }
    if (roll < 3) {
      return "m";
    }
  }
  let start = 0;
  for (const band of SKY_BANDS) {
    if (level < band.until) {
      const mix = (level - start) / (band.until - start);
      return BAYER[(y % 4) * 4 + (x % 4)] < mix * 16 ? band.to : band.from;
    }
    start = band.until;
  }
  return "h";
}

export function skyRows(): string[] {
  return grid(VIEW_WIDTH, SKY_HEIGHT, skyPaint);
}

const CRATERS = [
  { x: 11, y: 12, radius: 2.5 },
  { x: 19, y: 20, radius: 3 },
  { x: 20, y: 10, radius: 1.5 },
  { x: 13, y: 22, radius: 1.5 },
];

function moonPaint(x: number, y: number): string {
  const center = (MOON_SIZE - 1) / 2;
  const dx = x - center;
  const dy = y - center;
  const distance = Math.hypot(dx, dy);
  if (distance > 12.5) {
    return distance < 15.5 && (x + y) % 2 === 0 ? "h" : ".";
  }
  if (
    CRATERS.some(
      (crater) => Math.hypot(x - crater.x, y - crater.y) < crater.radius,
    )
  ) {
    return "q";
  }
  return dx + dy > 9 ? "q" : "o";
}

export function moonRows(): string[] {
  return grid(MOON_SIZE, MOON_SIZE, moonPaint);
}

function towerAt(x: number, y: number): string {
  const fromBottom = TOWERS_HEIGHT - y;
  for (const tower of TOWERS) {
    const inside = x >= tower.x && x < tower.x + tower.width;
    if (!inside) {
      continue;
    }
    const local = x - tower.x;
    const edge = local === tower.width - 1;
    if (fromBottom <= tower.height) {
      if (edge) {
        return "h";
      }
      const window =
        local % 6 === 3 && fromBottom % 14 === 6 && hash(x, y) % 3 === 0;
      return window ? "y" : "k";
    }
    const above = fromBottom - tower.height;
    if (tower.roof === "spire") {
      const half = tower.width / 2;
      const reach = half - above * 0.45;
      if (Math.abs(local + 0.5 - half) < reach) {
        return local + 0.5 >= half && Math.abs(local + 0.5 - half) > reach - 1
          ? "h"
          : "k";
      }
    }
    if (tower.roof === "battlement" && above <= 4 && local % 6 < 3) {
      return "k";
    }
    if (
      tower.mast > 0 &&
      local === Math.floor(tower.width / 2) &&
      above <= tower.mast
    ) {
      return "d";
    }
    if (tower.dish && above <= 7) {
      const dx = local - tower.width / 2;
      const ring = Math.hypot(dx, above - 7);
      if (ring < 6 && above >= 2) {
        return ring > 4.5 ? "h" : "k";
      }
    }
  }
  return ".";
}

export function towerRows(): string[] {
  return grid(VIEW_WIDTH, TOWERS_HEIGHT, towerAt);
}

export function towerLights(): { x: number; y: number }[] {
  return TOWERS.filter((tower) => tower.mast > 0).map((tower) => ({
    x: tower.x + Math.floor(tower.width / 2),
    y: TOWERS_HEIGHT - tower.height - tower.mast - 1,
  }));
}

function fogPaint(x: number, y: number): string {
  const middle = FOG_HEIGHT / 2;
  const density = 1 - Math.abs(y - middle) / middle;
  const wave = Math.sin((x + y * 3) / 17) * 0.5 + 0.5;
  return (hash(x, y) % 100) / 100 < density * 0.55 * wave ? "m" : ".";
}

export function fogRows(): string[] {
  return grid(VIEW_WIDTH, FOG_HEIGHT, fogPaint);
}
