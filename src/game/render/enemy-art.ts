import { GLYPHS } from "./font";
import { type SpriteRows, blank, outline, pad, stamp } from "./sprite";

export const SYNTAX_ERROR_FRAME = { width: 18, height: 26, left: 3, top: 2 };
export const WATCHDOG_FRAME = { width: 18, height: 18, left: 2, top: 3 };
export const SQUIGGLE_OFFSET = { x: 2, y: 21 };

type Pixel = readonly [x: number, y: number];

function crack(rows: SpriteRows, pixels: readonly Pixel[]): string[] {
  return rows.map((row, y) =>
    [...row]
      .map((pixel, x) =>
        pixels.some(([cx, cy]) => cx === x && cy === y) ? "k" : pixel,
      )
      .join(""),
  );
}

function compose(parts: readonly [SpriteRows, number, number][]): string[] {
  return outline(
    parts.reduce<string[]>(
      (frame, [rows, x, y]) => stamp(frame, rows, x, y),
      blank(SYNTAX_ERROR_FRAME.width, SYNTAX_ERROR_FRAME.height),
    ),
  );
}

const SKULL = [
  ".wwwww.",
  "wwwwwww",
  "wkRwkRw",
  "wkkwkkw",
  ".wwqww.",
  ".wkwkw.",
  "..www..",
];

const CRACKED_SKULL = crack(SKULL, [
  [3, 0],
  [3, 1],
  [4, 1],
]);

function openJaw(skull: SpriteRows): string[] {
  return [...skull.slice(0, -1), "..kkk..", skull.at(-1) ?? ""];
}

const RIBS = [
  "....q....",
  "..s.q.s..",
  ".s.wqw.s.",
  ".s.wqw.s.",
  "s.wwqww.s",
  ".s.wqw.s.",
  ".s.wqw.s.",
  "..s.q.s..",
  "...qqq...",
];

const BROKEN_RIBS = [
  "....q....",
  "..s.q.s..",
  ".s.wqw.s.",
  "...wqw.s.",
  "..wwq.w.s",
  "...wqw.s.",
  ".s.wqw.s.",
  "..s.q.s..",
  "...qqq...",
];

const ARMS = {
  rest: RIBS,
  pull: [
    "....q....",
    "..s.q....",
    ".s.wqw...",
    ".s.wqw.s.",
    "s.wwqww.s",
    ".s.wqw..s",
    ".s.wqw..s",
    "..s.q..s.",
    "...qqq...",
  ],
  raise: [
    "....q..ss",
    "..s.q.s..",
    ".s.wqw.s.",
    ".s.wqw...",
    "s.wwqww..",
    ".s.wqw...",
    ".s.wqw...",
    "..s.q....",
    "...qqq...",
  ],
  throw: [
    "....q....",
    "..s.q....",
    ".s.wqw...",
    ".s.wqwsss",
    "s.wwqww..",
    ".s.wqw...",
    ".s.wqw...",
    "..s.q....",
    "...qqq...",
  ],
  recoil: [
    "....q....",
    "..s.q.s..",
    ".s.wqw..s",
    ".s.wqw..s",
    "s.wwqww.s",
    ".s.wqw.s.",
    ".s.wqw.s.",
    "..s.q.s..",
    "...qqq...",
  ],
} as const;

const LEGS = {
  plant: [".q...q.", ".q...q.", ".q...q.", ".q...q.", "qq...qq"],
  liftLeft: [".q...q.", "q....q.", ".q...q.", "qq...q.", ".....qq"],
  liftRight: [".q...q.", ".q....q", ".q...q.", ".q...qq", "qq....."],
  buckle: ["q.....q", ".q...q.", "q.....q", ".q...q.", "qq...qq"],
} as const;

interface SkeletonPose {
  arms: keyof typeof ARMS;
  legs: keyof typeof LEGS;
  bob?: number;
  jaw?: boolean;
  tilt?: number;
  glyph?: boolean;
}

const SKELETON_POSES = {
  march1: { arms: "rest", legs: "plant" },
  march2: { arms: "rest", legs: "liftLeft", bob: -1, jaw: true },
  march3: { arms: "rest", legs: "plant" },
  march4: { arms: "rest", legs: "liftRight", bob: -1, jaw: true },
  pull: { arms: "pull", legs: "plant", bob: 1 },
  raise: { arms: "raise", legs: "plant", bob: -1, glyph: true },
  throw: { arms: "throw", legs: "liftRight", jaw: true },
  recoil: { arms: "recoil", legs: "plant" },
  hurt: { arms: "rest", legs: "plant", jaw: true, tilt: 1 },
} satisfies Record<string, SkeletonPose>;

export type SyntaxErrorPose = keyof typeof SKELETON_POSES;

export const MARCH: readonly SyntaxErrorPose[] = [
  "march1",
  "march2",
  "march3",
  "march4",
];

const HELD_GLYPH = GLYPHS[";"].map((row) => row.replaceAll("X", "s"));

function skeleton(pose: SkeletonPose, damaged: boolean): string[] {
  const bob = pose.bob ?? 0;
  const arms = damaged && pose.arms === "rest" ? BROKEN_RIBS : ARMS[pose.arms];
  const skull = damaged ? CRACKED_SKULL : SKULL;
  const parts: [SpriteRows, number, number][] = [
    [LEGS[pose.legs], 6, 17],
    [arms, 5, 8 + bob],
    [pose.jaw ? openJaw(skull) : skull, 6 - (pose.tilt ?? 0), 1 + bob],
  ];
  if (pose.glyph) {
    parts.push([HELD_GLYPH, 14, 1 + bob]);
  }
  return compose(parts);
}

function skeletonSet(damaged: boolean): Record<SyntaxErrorPose, string[]> {
  return Object.fromEntries(
    Object.entries<SkeletonPose>(SKELETON_POSES).map(([name, pose]) => [
      name,
      skeleton(pose, damaged),
    ]),
  ) as Record<SyntaxErrorPose, string[]>;
}

export const SYNTAX_ERROR_ART = skeletonSet(false);
export const SYNTAX_ERROR_DAMAGED_ART = skeletonSet(true);

const SQUIGGLE = ["R.R.R.R.R.R.R", ".R.R.R.R.R.R."];

export const SQUIGGLE_ART = [
  outline(pad(SQUIGGLE)),
  outline(pad([SQUIGGLE[1], SQUIGGLE[0]])),
] as const;

const BONE_PILE = [
  "..s.......s..",
  ".s.wqwqwqw.s.",
  "s.wqwqwqwqw.s",
  "qq.q.qq.q.qq.",
];

export const SYNTAX_ERROR_COLLAPSE = [
  compose([
    [LEGS.buckle, 6, 19],
    [BROKEN_RIBS, 6, 12],
    [openJaw(CRACKED_SKULL), 4, 6],
  ]),
  compose([
    [BONE_PILE, 3, 20],
    [CRACKED_SKULL, 0, 17],
  ]),
  compose([
    [["...........s..", "..qwqwq..s....", ".qq.q.qwqwq.qq"], 3, 21],
    [["...ww..", "..wkRw.", ".wwwww."], 0, 21],
  ]),
] as const;

const BODY = [
  "........5.......",
  ".......858......",
  "......87778.....",
  ".....8777778....",
  "....877777778...",
  "...87wwwwwww78..",
  "...7wwwwwwwww7..",
  "...7wwwwwwwww7..",
  "...7wwwwwwwww7..",
  "...7wwwwwwwww7..",
  "...87wwwwwww78..",
  "....877777778...",
  ".....6666666....",
  "......6.6.6.....",
];

const LEFT_FIN = ["5..", "45.", ".48"];
const RIGHT_FIN = ["..5", ".54", "84."];
const EYE_AT = { x: 4, y: 6 };

const LIDS = {
  open: ["wwbbbbbww", "wbbbbbbbw", "wbbbbbbbw", "wwbbbbbww"],
  closed: ["777777777", "777777777", "7kkkkkkk7", "wwbbbbbww"],
  squint: ["777777777", "7kkkkkkk7", "wqqqqqqqw", "wwqqqqqww"],
} as const;

const LENS_CRACK: readonly Pixel[] = [
  [0, 0],
  [1, 1],
  [2, 2],
];

const FINS = { up: -1, mid: 0, down: 1 } as const;
const LOOKS = { ahead: 0, up: -1, down: 1 } as const;

export type Fin = keyof typeof FINS;
export type Look = keyof typeof LOOKS;

interface EyePose {
  fin: Fin;
  look: Look;
  lid: keyof typeof LIDS;
  iris: string;
  pupil: string;
}

function eye({ look, lid, iris, pupil }: EyePose, damaged: boolean): string[] {
  let rows = LIDS[lid].map((row) => row.replaceAll("b", iris));
  if (lid === "open") {
    rows = stamp(rows, [pupil.repeat(2), pupil.repeat(2)], 4, 1 + LOOKS[look]);
  }
  return damaged && lid !== "closed" ? crack(rows, LENS_CRACK) : rows;
}

function watchdog(pose: EyePose, damaged: boolean): string[] {
  const dy = FINS[pose.fin];
  let body = stamp(BODY, LEFT_FIN, 1, 3 + dy);
  body = stamp(body, RIGHT_FIN, 13, 3 + dy);
  body = stamp(body, eye(pose, damaged), EYE_AT.x, EYE_AT.y);
  return outline(
    stamp(blank(WATCHDOG_FRAME.width, WATCHDOG_FRAME.height), body, 1, 2),
  );
}

const CHARGE_GLOW = [
  ["y", "k"],
  ["R", "k"],
  ["R", "L"],
] as const;

const WATCHDOG_KEYS = Object.fromEntries(
  (Object.keys(FINS) as Fin[]).map((fin) => [
    fin,
    Object.fromEntries(
      [...(Object.keys(LOOKS) as Look[]), "blink"].map((look) => [
        look,
        `${fin}-${look}`,
      ]),
    ),
  ]),
) as Record<Fin, Record<Look | "blink", string>>;

export const CHARGE_KEYS = CHARGE_GLOW.map((_, stage) => `charge${stage}`);

export function watchdogKey(fin: Fin, look: Look | "blink"): string {
  return WATCHDOG_KEYS[fin][look];
}

function watchdogPoses(): Record<string, EyePose> {
  const poses: Record<string, EyePose> = {};
  for (const fin of Object.keys(FINS) as Fin[]) {
    for (const look of Object.keys(LOOKS) as Look[]) {
      poses[watchdogKey(fin, look)] = {
        fin,
        look,
        lid: "open",
        iris: "b",
        pupil: "k",
      };
    }
    poses[watchdogKey(fin, "blink")] = {
      fin,
      look: "ahead",
      lid: "closed",
      iris: "b",
      pupil: "k",
    };
  }
  CHARGE_GLOW.forEach(([iris, pupil], stage) => {
    poses[CHARGE_KEYS[stage]] = {
      fin: "mid",
      look: "ahead",
      lid: "open",
      iris,
      pupil,
    };
  });
  poses.hurt = {
    fin: "down",
    look: "ahead",
    lid: "squint",
    iris: "q",
    pupil: "k",
  };
  return poses;
}

const WATCHDOG_POSES = watchdogPoses();

function watchdogSet(damaged: boolean): Record<string, string[]> {
  return Object.fromEntries(
    Object.entries(WATCHDOG_POSES).map(([name, pose]) => [
      name,
      watchdog(pose, damaged),
    ]),
  );
}

export const WATCHDOG_ART = watchdogSet(false);
export const WATCHDOG_DAMAGED_ART = watchdogSet(true);
