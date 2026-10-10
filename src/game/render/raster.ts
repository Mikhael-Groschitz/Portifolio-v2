import { TRANSPARENT } from "../palette";
import type { SpriteRows } from "./sprite";

export type Point = readonly [x: number, y: number];

export interface Raster {
  width: number;
  height: number;
  cells: string[][];
}

export function raster(width: number, height: number): Raster {
  return {
    width,
    height,
    cells: Array.from({ length: height }, () =>
      Array.from({ length: width }, () => TRANSPARENT),
    ),
  };
}

export function plot(target: Raster, x: number, y: number, key: string): void {
  const column = Math.round(x);
  const row = Math.round(y);
  if (column >= 0 && row >= 0 && column < target.width && row < target.height) {
    target.cells[row][column] = key;
  }
}

export function line(
  target: Raster,
  from: Point,
  to: Point,
  key: string,
  thickness = 1,
): void {
  const steps = Math.max(
    Math.abs(to[0] - from[0]),
    Math.abs(to[1] - from[1]),
    1,
  );
  for (let step = 0; step <= steps; step++) {
    const x = from[0] + ((to[0] - from[0]) * step) / steps;
    const y = from[1] + ((to[1] - from[1]) * step) / steps;
    for (let dy = 0; dy < thickness; dy++) {
      for (let dx = 0; dx < thickness; dx++) {
        plot(target, x + dx, y + dy, key);
      }
    }
  }
}

export function rect(
  target: Raster,
  left: number,
  top: number,
  width: number,
  height: number,
  key: string,
): void {
  for (let y = top; y < top + height; y++) {
    for (let x = left; x < left + width; x++) {
      plot(target, x, y, key);
    }
  }
}

export function disc(
  target: Raster,
  center: Point,
  radius: number,
  key: string,
): void {
  for (let y = Math.floor(center[1] - radius); y <= center[1] + radius; y++) {
    for (let x = Math.floor(center[0] - radius); x <= center[0] + radius; x++) {
      if (Math.hypot(x - center[0], y - center[1]) <= radius) {
        plot(target, x, y, key);
      }
    }
  }
}

export function place(
  target: Raster,
  part: SpriteRows,
  left: number,
  top: number,
): void {
  part.forEach((row, y) => {
    [...row].forEach((key, x) => {
      if (key !== TRANSPARENT) {
        plot(target, left + x, top + y, key);
      }
    });
  });
}

export function rowsOf(target: Raster): string[] {
  return target.cells.map((row) => row.join(""));
}
