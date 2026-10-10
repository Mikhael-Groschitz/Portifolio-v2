import type { Box } from "../core/collision";
import type { HeroPose } from "../entities/hero";
import { runFrames } from "./hero-run";
import { type SpriteRows, blank, outline, stamp } from "./sprite";

export const HERO_FRAME = { width: 24, height: 32, left: 6, top: 4 } as const;

export function frameTop(body: Box): number {
  return Math.round(body.y + body.height) - HERO_FRAME.height;
}

const HEAD = [
  "...HHHH..",
  ".H777HHH.",
  "H7HHHHHHH",
  "778HfffHH",
  "787Fffkf.",
  "777ffffff",
  ".HfffffF.",
  "..ffffF..",
  "...FF....",
];

const TORSO = [
  "...wFw..",
  ".667ww6.",
  "6667wy66",
  "6667ww76",
  "66666676",
  "66666666",
  "66666666",
  ".kkkkky.",
];

const LEGS: Record<string, SpriteRows> = {
  stand: [
    "222222",
    "222322",
    "222322",
    "22.232",
    "22.232",
    "22.232",
    "22.232",
    "22.232",
    "11.1111",
    "11.1111",
  ],
  stride: [
    "222222",
    "2223222",
    ".222.322",
    ".22...322",
    "222....32",
    "22.....32",
    "22.....322",
    "11......111",
    "111.....111",
  ],
  tuck: [
    "222222",
    "2223222",
    ".2223322",
    "..222.32",
    "..22..32",
    "..11.111",
    "..11.11",
  ],
  kneel: ["......222", "......2222", ".......322", "11.....222", "11....1111"],
  reach: [
    "222222",
    "222322",
    "222.32",
    "22..322",
    "22...32",
    "22...32",
    "22...32",
    "11...11",
    "11...111",
  ],
};

const CAPE: Record<string, SpriteRows> = {
  rest: [
    "......nnn",
    ".....nnnn",
    "....nnbbn",
    "....nnnnn",
    "...nssnnn",
    "...nnnnnn",
    "..nnggnnn",
    "..nnnnnnn",
    "..nvvvnnn",
    ".nnnnnnnn",
    ".nnbbnsnn",
    ".nnnnnnnn",
    "nnggnnvnn",
    "nnnnnnnnn",
    "rnrnnrnnr",
    "c..c..c..",
    "y..c..y..",
  ],
  sway: [
    ".......nn",
    "......nnn",
    ".....nbbn",
    ".....nnnn",
    "....nssnn",
    "....nnnnn",
    "...nggnnn",
    "...nnnnnn",
    "..nvvvnnn",
    "..nnnnnnn",
    ".nnbbnsnn",
    ".nnnnnnnn",
    ".nggnnvnn",
    "nnnnnnnnn",
    "nrnnrnnrn",
    ".c..c..c.",
    ".y..c..y.",
  ],
  flutter: [
    "........nn",
    "......nnnn",
    "....nnnbbn",
    "..nnnnnnnn",
    ".nnssnnnnn",
    "nnnnnnnggn",
    "rnnggnnnnn",
    ".rnnnnvvnn",
    "..rnnnnnnn",
    "...rnbbnsn",
    "....rnnnnn",
    ".....rnggn",
    "......rnnn",
    ".......rr.",
    "......c.c.",
    "......y.y.",
  ],
  rise: [
    ".......nn",
    "......nnn",
    ".....nbbn",
    ".....nnnn",
    ".....nssn",
    ".....nnnn",
    "....nggnn",
    "....nnnnn",
    "....nvvnn",
    "....nnnnn",
    "...nnbbnn",
    "...nnnnnn",
    "...nggnnn",
    "...rnrnrn",
    "...c.c.c.",
    "...y.c.y.",
  ],
  crouch: [
    "......nnn",
    "....nnnnn",
    "...nnbbnn",
    "..nnnnsnn",
    ".nnggnnnn",
    "nnnnnvvnn",
    "rnrnrnnrn",
    "c..y..c..",
  ],
  billow: [
    "cc.c......",
    "rrnrn.....",
    ".nnnnnn...",
    ".nbbnnnnn.",
    "..nnnssnnn",
    "..nggnnnnn",
    "...nnnvvnn",
    "....nnnnnn",
    ".....nnnnn",
    "......nnnn",
  ],
};

const ARM: Record<string, SpriteRows> = {
  rest: ["67", "67", "67", "67", "ff", "fc", "cc.c", "c..c", ".cc."],
  windup: ["ff....", "ff7...", ".777..", "..777.", "...777", "....77"],
  strike: ["6777ff", "6778ff"],
  hurt: ["ff.", "f7.", ".77", ".77", "..7"],
};

const CLOUD_ICON = [
  "........wwwww...........",
  "......wwqqqqqw..........",
  "....wwqqqqqqqqw..wwww...",
  "...wqqqqqqqqqqqwwqqqqw..",
  "..wqqqqbbbbqqqqqqqqqqqw.",
  ".wqqqqqqqqqqqqsssqqqqqw.",
  "wqqqqgggqqqqqqqqqqqqqqqw",
  "wqqqqqqqqqqqvvvvqqqqqqqw",
  "wqqqqqqqqqqqqqqqqqqqqqqw",
  ".wwqqqqqqqqqqqqqqqqqqww.",
  "...wwwwwwwwwwwwwwwwww...",
];

const CROUCH_DROP = 10;

interface Layout {
  cape: string;
  capeAt: readonly [number, number];
  legs: string;
  legsAt?: readonly [number, number];
  arm: string;
  armAt: readonly [number, number];
  bob?: number;
}

export type HeroFrame =
  | "idle1"
  | "idle2"
  | "jump"
  | "fall"
  | "windup"
  | "strike"
  | "hurt"
  | "crouch"
  | "crouchStrike";

const LAYOUTS: Record<HeroFrame, Layout> = {
  idle1: {
    cape: "rest",
    capeAt: [2, 13],
    legs: "stand",
    arm: "rest",
    armAt: [11, 15],
  },
  idle2: {
    cape: "sway",
    capeAt: [2, 13],
    legs: "stand",
    arm: "rest",
    armAt: [11, 15],
    bob: 1,
  },
  jump: {
    cape: "rise",
    capeAt: [1, 13],
    legs: "tuck",
    arm: "rest",
    armAt: [11, 15],
  },
  fall: {
    cape: "billow",
    capeAt: [0, 7],
    legs: "reach",
    arm: "rest",
    armAt: [11, 15],
  },
  windup: {
    cape: "sway",
    capeAt: [2, 13],
    legs: "stand",
    arm: "windup",
    armAt: [6, 9],
  },
  strike: {
    cape: "flutter",
    capeAt: [0, 13],
    legs: "stride",
    arm: "strike",
    armAt: [12, 15],
  },
  hurt: {
    cape: "billow",
    capeAt: [0, 7],
    legs: "reach",
    arm: "hurt",
    armAt: [14, 10],
  },
  crouch: {
    cape: "crouch",
    capeAt: [2, 13],
    legs: "kneel",
    legsAt: [10, 27],
    arm: "rest",
    armAt: [11, 15],
    bob: CROUCH_DROP,
  },
  crouchStrike: {
    cape: "crouch",
    capeAt: [2, 13],
    legs: "kneel",
    legsAt: [10, 27],
    arm: "strike",
    armAt: [12, 15],
    bob: CROUCH_DROP,
  },
};

export const WALK_FRAMES = [
  "walk1",
  "walk2",
  "walk3",
  "walk4",
  "walk5",
  "walk6",
  "walk7",
  "walk8",
] as const;

export const STEP_FRAMES = 4;

type WalkFrame = (typeof WALK_FRAMES)[number];

export type HeroArtFrame = HeroFrame | WalkFrame | "cloud";

export const HERO_FRAMES: readonly HeroArtFrame[] = [
  ...(Object.keys(LAYOUTS) as HeroFrame[]),
  ...WALK_FRAMES,
  "cloud",
];

export const LASH_HAND = {
  windup: { x: 6, y: 9 },
  strike: { x: 18, y: 15 },
  crouchStrike: { x: 18, y: 15 + CROUCH_DROP },
} as const;

function compose({
  cape,
  capeAt,
  legs,
  legsAt = [10, 22],
  arm,
  armAt,
  bob = 0,
}: Layout): string[] {
  let frame = blank(HERO_FRAME.width, HERO_FRAME.height);
  frame = stamp(frame, CAPE[cape], capeAt[0], capeAt[1] + bob);
  frame = stamp(frame, LEGS[legs], legsAt[0], legsAt[1]);
  frame = stamp(frame, TORSO, 9, 14 + bob);
  frame = stamp(frame, HEAD, 9, 5 + bob);
  frame = stamp(frame, ARM[arm], armAt[0], armAt[1] + bob);
  return outline(frame);
}

export const HERO_ART: Readonly<Record<HeroArtFrame, string[]>> = {
  ...(Object.fromEntries(
    (Object.keys(LAYOUTS) as HeroFrame[]).map((frame) => [
      frame,
      compose(LAYOUTS[frame]),
    ]),
  ) as Record<HeroFrame, string[]>),
  ...(Object.fromEntries(
    runFrames(HEAD, TORSO).map((rows, index) => [
      WALK_FRAMES[index],
      outline(rows),
    ]),
  ) as Record<WalkFrame, string[]>),
  cloud: outline(
    stamp(blank(HERO_FRAME.width, HERO_FRAME.height), CLOUD_ICON, 0, 12),
  ),
};

export function heroFrame(
  pose: HeroPose,
  stride: number,
  clock: number,
): HeroArtFrame {
  switch (pose) {
    case "walk":
      return WALK_FRAMES[Math.floor(stride / STEP_FRAMES) % WALK_FRAMES.length];
    case "idle":
      return Math.floor(clock / 40) % 2 === 0 ? "idle1" : "idle2";
    case "cast":
      return "strike";
    default:
      return pose;
  }
}
