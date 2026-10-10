import { textRows } from "./font";
import {
  type Point,
  type Raster,
  disc,
  line,
  plot,
  raster,
  rect,
  rowsOf,
} from "./raster";
import { type SpriteRows, blank, outline, stamp } from "./sprite";

export const LEGACY_FRAME = { width: 60, height: 66, left: 17, top: 10 };
export const THRONE_FRAME = { width: 64, height: 88 };
export const SCREEN = { width: 16, height: 11 } as const;

const CENTER = 30;
const CASING = { width: 22, height: 17 } as const;
const PANEL = { width: 18, height: 19 } as const;
const TAPE = ["H", "k", "H", "5", "H", "k"];

interface Limb {
  from: Point;
  to: Point;
}

interface LegacyPose {
  head: number;
  arms: readonly [Limb, Limb];
  legs: "seated" | "standing" | "tucked";
  cape: "draped" | "flared";
}

function casing(target: Raster, top: number): Point {
  const left = CENTER - CASING.width / 2;
  rect(target, left, top, CASING.width, CASING.height, "o");
  rect(target, left + CASING.width - 1, top + 1, 1, CASING.height - 1, "q");
  rect(target, left + 1, top + CASING.height - 1, CASING.width - 1, 1, "q");
  rect(target, left + 2, top + 1, SCREEN.width + 2, SCREEN.height + 2, "q");
  rect(target, left + 3, top + 2, SCREEN.width, SCREEN.height, "n");
  for (let x = left + 4; x < left + 12; x += 2) {
    plot(target, x, top + CASING.height - 2, "q");
  }
  plot(target, left + CASING.width - 5, top + CASING.height - 2, "g");
  rect(target, CENTER - 4, top + CASING.height, 8, 2, "q");
  return [left + 3, top + 2];
}

function panel(target: Raster, top: number): void {
  const left = CENTER - PANEL.width / 2;
  rect(target, left, top, PANEL.width, PANEL.height, "6");
  rect(target, left + 1, top + 1, PANEL.width - 2, PANEL.height - 2, "7");
  for (let index = 0; index < 7; index++) {
    plot(target, left + 2 + index * 2, top + 3, index % 3 === 0 ? "y" : "6");
    plot(target, left + 2 + index * 2, top + 5, index % 2 === 0 ? "y" : "6");
  }
  for (let index = 0; index < 5; index++) {
    const x = left + 3 + index * 3;
    line(target, [x, top + 9], [x, top + 12], "8");
    plot(target, x, top + 9, "k");
  }
  rect(target, left + 3, top + 15, PANEL.width - 6, 2, "6");
  disc(target, [left + 5, top + 15.5], 1.2, "R");
}

function tapeKey(x: number): string {
  return TAPE[((x % TAPE.length) + TAPE.length) % TAPE.length];
}

function card(target: Raster, left: number, top: number): void {
  rect(target, left, top, 4, 6, "o");
  rect(target, left + 3, top, 1, 6, "q");
  plot(target, left + 1, top + 1, "k");
  plot(target, left + 2, top + 3, "k");
  plot(target, left + 1, top + 4, "k");
}

function drapedCape(target: Raster, top: number, bottom: number): void {
  for (let y = top; y < bottom; y++) {
    const spread = 10 + Math.floor((y - top) / 4);
    for (let x = CENTER - spread; x < CENTER + spread; x++) {
      plot(target, x, y, tapeKey(x));
    }
  }
  const spread = 10 + Math.floor((bottom - top) / 4);
  for (let x = CENTER - spread; x < CENTER + spread - 3; x += 5) {
    card(target, x, bottom - 2 + ((x * 3) % 4));
  }
}

function flaredCape(target: Raster, top: number): void {
  for (let side = -1; side <= 1; side += 2) {
    for (let step = 0; step < 24; step++) {
      const x = CENTER + side * (6 + step);
      const lift = Math.round(step * 0.9);
      for (let y = top - lift; y < top + 30 - step; y++) {
        plot(target, x, y, tapeKey(x));
      }
      if (step % 5 === 4) {
        card(target, x - 1, top + 28 - step);
      }
    }
  }
}

function sleeve(target: Raster, { from, to }: Limb): void {
  line(target, from, to, "6", 3);
  line(target, from, to, "8");
  rect(target, to[0], to[1], 3, 3, "6");
  plot(target, to[0] - 1, to[1] + 3, "5");
  plot(target, to[0] + 1, to[1] + 4, "5");
  plot(target, to[0] + 3, to[1] + 3, "5");
}

function legs(target: Raster, kind: LegacyPose["legs"], hip: number): void {
  if (kind === "seated") {
    rect(target, CENTER - 6, hip, 20, 5, "2");
    rect(target, CENTER + 10, hip + 5, 5, 11, "2");
    rect(target, CENTER + 10, hip + 16, 8, 3, "1");
    rect(target, CENTER - 8, hip + 5, 5, 11, "1");
    rect(target, CENTER - 8, hip + 16, 7, 3, "k");
    return;
  }
  const spread = kind === "tucked" ? 2 : 4;
  rect(target, CENTER - spread - 4, hip, 5, 15, "2");
  rect(target, CENTER + spread - 1, hip, 5, 15, "1");
  rect(target, CENTER - spread - 5, hip + 15, 7, 3, "1");
  rect(target, CENTER + spread - 1, hip + 15, 7, 3, "k");
}

export interface LegacyBody {
  rows: string[];
  screen: Point;
}

function body(pose: LegacyPose): LegacyBody {
  const target = raster(LEGACY_FRAME.width, LEGACY_FRAME.height);
  const top = LEGACY_FRAME.top + pose.head;
  const shoulders = top + CASING.height + 2;
  if (pose.cape === "flared") {
    flaredCape(target, shoulders);
  } else {
    drapedCape(target, shoulders, LEGACY_FRAME.height - 6);
  }
  legs(target, pose.legs, shoulders + PANEL.height);
  panel(target, shoulders);
  const screen = casing(target, top);
  for (const limb of pose.arms) {
    sleeve(target, limb);
  }
  return { rows: outline(rowsOf(target)), screen };
}

const POSES = {
  seated: {
    head: 0,
    arms: [
      { from: [22, 30], to: [14, 46] },
      { from: [38, 30], to: [44, 46] },
    ],
    legs: "seated",
    cape: "draped",
  },
  cast: {
    head: 0,
    arms: [
      { from: [22, 30], to: [14, 46] },
      { from: [38, 30], to: [52, 24] },
    ],
    legs: "seated",
    cape: "draped",
  },
  standing: {
    head: 0,
    arms: [
      { from: [22, 30], to: [16, 48] },
      { from: [38, 30], to: [44, 48] },
    ],
    legs: "standing",
    cape: "draped",
  },
  dive: {
    head: 4,
    arms: [
      { from: [22, 34], to: [6, 16] },
      { from: [38, 34], to: [52, 16] },
    ],
    legs: "tucked",
    cape: "flared",
  },
  recover: {
    head: 3,
    arms: [
      { from: [22, 33], to: [14, 50] },
      { from: [38, 33], to: [46, 50] },
    ],
    legs: "standing",
    cape: "draped",
  },
} satisfies Record<string, LegacyPose>;

export type LegacyPoseName = keyof typeof POSES;

export const LEGACY_ART = Object.fromEntries(
  Object.entries<LegacyPose>(POSES).map(([name, pose]) => [name, body(pose)]),
) as Record<LegacyPoseName, LegacyBody>;

function screenOf(...lines: readonly (readonly [string, string, number])[]) {
  let rows = blank(SCREEN.width, SCREEN.height);
  for (const [text, paint, top] of lines) {
    const glyphs = textRows(text, paint);
    rows = stamp(
      rows,
      glyphs,
      Math.floor((SCREEN.width - glyphs[0].length) / 2),
      top,
    );
  }
  return rows;
}

function noise(): string[] {
  return Array.from({ length: SCREEN.height }, (_, y) =>
    Array.from({ length: SCREEN.width }, (_, x) =>
      (x * 7 + y * 13 + x * y) % 5 === 0 ? "w" : "h",
    ).join(""),
  );
}

export const FACES = {
  off: screenOf(["-", "h", 3]),
  boot: screenOf(["LOAD", "g", 3]),
  idle: screenOf(["O O", "y", 0], ["\\/\\/", "y", 6]),
  patched: screenOf(["> <", "R", 0], ["\\/\\/", "R", 6]),
  hurt: noise(),
  rewind: screenOf(["<<", "y", 0], ["<<", "y", 6]),
  commit: screenOf(["X X", "y", 0], ["---", "y", 6]),
} as const satisfies Record<string, SpriteRows>;

export type Face = keyof typeof FACES;

export const HOTFIX_NOTE = outline(
  stamp(
    blank(15, 7).map((row) => row.replaceAll(".", "y")),
    textRows("FIX", "k"),
    2,
    1,
  ),
);

function throne(): string[] {
  const target = raster(THRONE_FRAME.width, THRONE_FRAME.height);
  rect(target, 8, 6, 48, 64, "6");
  rect(target, 10, 8, 44, 60, "7");
  for (let y = 14; y < 68; y += 8) {
    rect(target, 10, y, 44, 1, "6");
    for (let x = 14; x < 50; x += 4) {
      plot(target, x, y + 4, "k");
    }
  }
  rect(target, 22, 0, 20, 8, "6");
  rect(target, 24, 2, 16, 4, "7");
  for (const middle of [11, 53]) {
    for (let y = 0; y < 6; y++) {
      const half = 1 + Math.floor(y / 2);
      rect(target, middle - half, y, half * 2, 1, "6");
    }
  }
  rect(target, 0, 54, 12, 20, "6");
  rect(target, 52, 54, 12, 20, "6");
  rect(target, 2, 56, 8, 8, "1");
  rect(target, 54, 56, 8, 8, "1");
  rect(target, 4, 68, 56, 6, "8");
  rect(target, 4, 74, 56, 14, "6");
  rect(target, 6, 76, 52, 10, "7");
  for (let x = 10; x < 56; x += 6) {
    rect(target, x, 79, 3, 1, "k");
  }
  return outline(rowsOf(target));
}

export const THRONE = throne();

export const THRONE_LEDS: readonly Point[] = [
  [12, 18],
  [12, 26],
  [12, 34],
  [12, 42],
  [51, 18],
  [51, 26],
  [51, 34],
  [51, 42],
  [16, 82],
  [28, 82],
  [40, 82],
  [52, 82],
];

export const REELS: readonly Point[] = [
  [6, 60],
  [58, 60],
  [32, 4],
];

function reel(turn: number): string[] {
  const size = 9;
  const target = raster(size, size);
  const middle = (size - 1) / 2;
  disc(target, [middle, middle], 4, "H");
  disc(target, [middle, middle], 1.5, "8");
  for (let spoke = 0; spoke < 3; spoke++) {
    const angle = turn + (spoke * 2 * Math.PI) / 3;
    line(
      target,
      [middle, middle],
      [middle + Math.cos(angle) * 3.5, middle + Math.sin(angle) * 3.5],
      "8",
    );
  }
  return outline(rowsOf(target));
}

export const REEL_FRAMES = [0, 1, 2].map((step) =>
  reel((step * 2 * Math.PI) / 9),
);

function label(text: string): string[] {
  const glyphs = textRows(text, "y");
  const width = glyphs[0].length + 6;
  return outline(
    stamp(
      blank(width, 9).map((row, y) =>
        y === 0 || y === 8 ? "6".repeat(width) : `6${"n".repeat(width - 2)}6`,
      ),
      glyphs,
      3,
      2,
    ),
  );
}

export const COMMAND_LABELS = {
  perform: label("PERFORM UNTIL"),
  goto: label("GO TO"),
  call: label("CALL"),
  rollback: label("ROLLBACK"),
  commit: label("COMMIT"),
} as const;

export type Command = keyof typeof COMMAND_LABELS;

export const PUNCHED_CARDS = [
  outline([
    ".ooooooooo",
    "oqkoqkoqko",
    "oooooooooo",
    "okoqkoqkoq",
    "oooooooooo",
    "oqqqqqqqqq",
  ]),
  outline([
    ".ooooooooo",
    "okoqokoqko",
    "oooooooooo",
    "oqkoqkoqko",
    "oooooooooo",
    "oqqqqqqqqq",
  ]),
] as const;
