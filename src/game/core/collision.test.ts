import { describe, expect, it } from "vitest";
import { TILE, parseLevel } from "../levels/level";
import { type Body, moveBody, overlaps } from "./collision";

const ROOM = parseLevel([
  "##########",
  "#        #",
  "#   ==   #",
  "#S      E#",
  "##########",
]);

function body(x: number, y: number, vx = 0, vy = 0): Body {
  return { x, y, width: 12, height: 12, vx, vy, grounded: false };
}

describe("overlaps", () => {
  it("detects boxes that share area and ignores boxes that only touch", () => {
    const a = { x: 0, y: 0, width: 10, height: 10 };
    expect(overlaps(a, { x: 9, y: 9, width: 4, height: 4 })).toBe(true);
    expect(overlaps(a, { x: 10, y: 0, width: 4, height: 4 })).toBe(false);
    expect(overlaps(a, { x: 0, y: 10, width: 4, height: 4 })).toBe(false);
    expect(overlaps(a, { x: -5, y: -5, width: 30, height: 30 })).toBe(true);
  });
});

describe("moveBody", () => {
  it("stops at walls and keeps the body outside them", () => {
    const moving = body(9 * TILE - 13, 3 * TILE + 2, 3);
    moveBody(ROOM, moving);
    expect(moving.x).toBe(9 * TILE - 12);
    expect(moving.vx).toBe(0);
    const back = body(TILE + 1, 3 * TILE + 2, -3);
    moveBody(ROOM, back);
    expect(back.x).toBe(TILE);
  });

  it("lands on the floor and reports it", () => {
    const falling = body(3 * TILE, 4 * TILE - 13, 0, 4);
    moveBody(ROOM, falling);
    expect(falling).toMatchObject({
      y: 4 * TILE - 12,
      vy: 0,
      grounded: true,
    });
  });

  it("lands on ledges only from above", () => {
    const above = body(4 * TILE, 2 * TILE - 13, 0, 3);
    moveBody(ROOM, above);
    expect(above).toMatchObject({ y: 2 * TILE - 12, grounded: true });
    const below = body(4 * TILE, 2 * TILE + 6, 0, -4);
    moveBody(ROOM, below);
    expect(below.y).toBe(2 * TILE + 2);
    expect(below.vy).toBe(-4);
  });

  it("bumps the head on solid ceilings", () => {
    const rising = body(3 * TILE, TILE + 2, 0, -5);
    moveBody(ROOM, rising);
    expect(rising).toMatchObject({ y: TILE, vy: 0, grounded: false });
  });
});
