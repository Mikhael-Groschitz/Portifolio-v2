import { TRANSPARENT } from "../palette";
import { textRows } from "./font";
import { type SpriteRows, blank, outline, pad, stamp } from "./sprite";

const SCALE = 2;
const LETTER_GAP = 2;
const SHADOW = "r";
const GRADIENT = "wooqq555";

export const LETTERS: Readonly<Record<string, SpriteRows>> = {
  S: [
    "..XXXXXX..",
    ".XXX..XXX.",
    "XXX....XX.",
    "XXX.......",
    "XXXX......",
    ".XXXXXX...",
    "...XXXXXX.",
    "......XXXX",
    ".......XXX",
    "X......XXX",
    "XX.....XXX",
    ".XXX..XXX.",
    "..XXXXXX..",
  ],
  Y: [
    "XXX....XXX",
    ".XX....XX.",
    ".XXX..XXX.",
    "..XX..XX..",
    "..XXXXXX..",
    "...XXXX...",
    "....XX....",
    "....XX....",
    "....XX....",
    "....XX....",
    "....XX....",
    "...XXXX...",
    "..XXXXXX..",
  ],
  M: [
    "XXX......XXX",
    "XXXX....XXXX",
    "XXXXX..XXXXX",
    "XX.XXXXXX.XX",
    "XX..XXXX..XX",
    "XX...XX...XX",
    "XX........XX",
    "XX........XX",
    "XX........XX",
    "XX........XX",
    "XX........XX",
    "XXX......XXX",
    "XXXX....XXXX",
  ],
  P: [
    "XXXXXXXX..",
    ".XX....XX.",
    ".XX.....XX",
    ".XX.....XX",
    ".XX.....XX",
    ".XX....XX.",
    ".XXXXXXX..",
    ".XX.......",
    ".XX.......",
    ".XX.......",
    ".XX.......",
    ".XXX......",
    "XXXXX.....",
  ],
  H: [
    "XXXX..XXXX",
    ".XX....XX.",
    ".XX....XX.",
    ".XX....XX.",
    ".XX....XX.",
    ".XXXXXXXX.",
    ".XXXXXXXX.",
    ".XX....XX.",
    ".XX....XX.",
    ".XX....XX.",
    ".XX....XX.",
    ".XX....XX.",
    "XXXX..XXXX",
  ],
  O: [
    "....XX....",
    "...XXXX...",
    "..XX..XX..",
    ".XX....XX.",
    "XX......XX",
    "XX......XX",
    "XX......XX",
    "XX......XX",
    "XX......XX",
    ".XX....XX.",
    "..XX..XX..",
    "...XXXX...",
    "....XX....",
  ],
  N: [
    "XXX.....XXX",
    ".XXX.....X.",
    ".XXXX....X.",
    ".XX.XX...X.",
    ".XX..XX..X.",
    ".XX...XX.X.",
    ".XX....XXX.",
    ".XX.....XX.",
    ".XX......X.",
    ".XX......X.",
    ".XX......X.",
    ".XX......X.",
    "XXXX.....X.",
  ],
  D: [
    "XXXXXXX...",
    ".XX...XX..",
    ".XX....XX.",
    ".XX.....XX",
    ".XX.....XX",
    ".XX.....XX",
    ".XX.....XX",
    ".XX.....XX",
    ".XX.....XX",
    ".XX.....XX",
    ".XX....XX.",
    ".XX...XX..",
    "XXXXXXX...",
  ],
  A: [
    "....XX....",
    "....XX....",
    "...XXXX...",
    "...X..XX..",
    "..XX..XX..",
    "..X....XX.",
    ".XX....XX.",
    ".XXXXXXXX.",
    ".XX.....XX",
    "XX......XX",
    "XX......XX",
    "XX......XX",
    "XXX....XXX",
  ],
  T: [
    "XXXXXXXXXX",
    "XX..XX..XX",
    "X...XX...X",
    "....XX....",
    "....XX....",
    "....XX....",
    "....XX....",
    "....XX....",
    "....XX....",
    "....XX....",
    "....XX....",
    "...XXXX...",
    "..XXXXXX..",
  ],
  B: [
    "XXXXXXX...",
    ".XX...XX..",
    ".XX....XX.",
    ".XX....XX.",
    ".XX...XX..",
    ".XXXXXX...",
    ".XXXXXXX..",
    ".XX....XX.",
    ".XX.....XX",
    ".XX.....XX",
    ".XX....XX.",
    ".XX...XX..",
    "XXXXXXX...",
  ],
  E: [
    "XXXXXXXXX.",
    ".XX....XX.",
    ".XX.....X.",
    ".XX.......",
    ".XX...X...",
    ".XXXXXX...",
    ".XXXXXX...",
    ".XX...X...",
    ".XX.......",
    ".XX.......",
    ".XX.....X.",
    ".XX....XX.",
    "XXXXXXXXX.",
  ],
};

const PLUG = [".kkkkk.", "k88wwwy", "k88wwwy", ".kkkkk."];

function wordMask(word: string): string[] {
  const letters = [...word].map((letter) => LETTERS[letter]);
  const width = letters.reduce(
    (total, letter, index) =>
      total + letter[0].length + (index > 0 ? LETTER_GAP : 0),
    0,
  );
  let mask = blank(width, letters[0].length);
  let left = 0;
  for (const letter of letters) {
    mask = stamp(mask, letter, left, 0);
    left += letter[0].length + LETTER_GAP;
  }
  return mask;
}

function enlarge(mask: SpriteRows): string[] {
  return mask.flatMap((row) => {
    const wide = [...row].map((pixel) => pixel.repeat(SCALE)).join("");
    return Array.from({ length: SCALE }, () => wide);
  });
}

function shade(mask: SpriteRows): string[] {
  return mask.map((row, y) => {
    const paint = GRADIENT[Math.floor((y * GRADIENT.length) / mask.length)];
    return row.replaceAll("X", paint);
  });
}

function withShadow(rows: SpriteRows): string[] {
  const shadow = rows.map((row) =>
    [...row].map((pixel) => (pixel === TRANSPARENT ? pixel : SHADOW)).join(""),
  );
  const width = rows[0].length + 1;
  const height = rows.length + 2;
  return stamp(stamp(blank(width, height), shadow, 1, 2), rows, 0, 0);
}

function cable(width: number): string[] {
  const length = width - PLUG[0].length;
  const wire = [
    "k".repeat(length),
    "c".repeat(length),
    "b".repeat(length),
    "k".repeat(length),
  ];
  return stamp(stamp(blank(width, PLUG.length), wire, 0, 0), PLUG, length, 0);
}

function word(text: string): string[] {
  return outline(pad(shade(enlarge(wordMask(text)))));
}

export function titleRows(): string[] {
  const top = word("SYMPHONY");
  const bottom = word("DATABASE");
  const middle = outline(pad(textRows("OF THE", "b")));
  const width = Math.max(top[0].length, bottom[0].length) + 4;
  const wire = cable(bottom[0].length - 8);
  const middleTop = top.length + 3;
  const bottomTop = middleTop + middle.length + 4;
  const wireTop = bottomTop + bottom.length + 3;
  let rows = blank(width, wireTop + wire.length + 1);
  rows = stamp(
    rows,
    withShadow(top),
    Math.floor((width - top[0].length) / 2),
    0,
  );
  rows = stamp(
    rows,
    middle,
    Math.floor((width - middle[0].length) / 2),
    middleTop,
  );
  rows = stamp(
    rows,
    withShadow(bottom),
    Math.floor((width - bottom[0].length) / 2),
    bottomTop,
  );
  rows = stamp(rows, wire, Math.floor((width - wire[0].length) / 2), wireTop);
  return rows;
}
