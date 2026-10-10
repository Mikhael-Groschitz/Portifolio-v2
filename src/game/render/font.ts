import { type SpriteRows, blank, stamp } from "./sprite";

export const FONT_HEIGHT = 5;

const LETTER_GAP = 1;

export const GLYPHS: Readonly<Record<string, SpriteRows>> = {
  A: [".X.", "X.X", "XXX", "X.X", "X.X"],
  B: ["XX.", "X.X", "XX.", "X.X", "XX."],
  C: [".XX", "X..", "X..", "X..", ".XX"],
  D: ["XX.", "X.X", "X.X", "X.X", "XX."],
  E: ["XXX", "X..", "XX.", "X..", "XXX"],
  F: ["XXX", "X..", "XX.", "X..", "X.."],
  G: [".XX", "X..", "X.X", "X.X", ".XX"],
  H: ["X.X", "X.X", "XXX", "X.X", "X.X"],
  I: ["XXX", ".X.", ".X.", ".X.", "XXX"],
  J: ["..X", "..X", "..X", "X.X", ".X."],
  K: ["X.X", "X.X", "XX.", "X.X", "X.X"],
  L: ["X..", "X..", "X..", "X..", "XXX"],
  M: ["X...X", "XX.XX", "X.X.X", "X...X", "X...X"],
  N: ["X..X", "XX.X", "X.XX", "X..X", "X..X"],
  O: [".X.", "X.X", "X.X", "X.X", ".X."],
  P: ["XX.", "X.X", "XX.", "X..", "X.."],
  Q: [".X.", "X.X", "X.X", "X.X", ".XX"],
  R: ["XX.", "X.X", "XX.", "X.X", "X.X"],
  S: [".XX", "X..", ".X.", "..X", "XX."],
  T: ["XXX", ".X.", ".X.", ".X.", ".X."],
  U: ["X.X", "X.X", "X.X", "X.X", "XXX"],
  V: ["X.X", "X.X", "X.X", "X.X", ".X."],
  W: ["X...X", "X...X", "X.X.X", "XX.XX", "X...X"],
  X: ["X.X", "X.X", ".X.", "X.X", "X.X"],
  Y: ["X.X", "X.X", ".X.", ".X.", ".X."],
  Z: ["XXX", "..X", ".X.", "X..", "XXX"],
  "0": ["XXX", "X.X", "X.X", "X.X", "XXX"],
  "1": [".X.", "XX.", ".X.", ".X.", "XXX"],
  "2": ["XX.", "..X", ".X.", "X..", "XXX"],
  "3": ["XX.", "..X", ".X.", "..X", "XX."],
  "4": ["X.X", "X.X", "XXX", "..X", "..X"],
  "5": ["XXX", "X..", "XX.", "..X", "XX."],
  "6": [".XX", "X..", "XX.", "X.X", ".X."],
  "7": ["XXX", "..X", ".X.", ".X.", ".X."],
  "8": [".X.", "X.X", ".X.", "X.X", ".X."],
  "9": [".X.", "X.X", ".XX", "..X", "XX."],
  ";": ["..", ".X", "..", ".X", "X."],
  ":": [".", "X", ".", "X", "."],
  ".": [".", ".", ".", ".", "X"],
  ",": [".", ".", ".", "X", "X"],
  "!": ["X", "X", "X", ".", "X"],
  "?": ["XX.", "..X", ".X.", "...", ".X."],
  "-": ["...", "...", "XXX", "...", "..."],
  "'": ["X", "X", ".", ".", "."],
  "%": ["X.X", "..X", ".X.", "X..", "X.X"],
  "/": ["..X", "..X", ".X.", "X..", "X.."],
  "\\": ["X..", "X..", ".X.", "..X", "..X"],
  "<": ["..X", ".X.", "X..", ".X.", "..X"],
  ">": ["X..", ".X.", "..X", ".X.", "X.."],
  "(": [".X", "X.", "X.", "X.", ".X"],
  ")": ["X.", ".X", ".X", ".X", "X."],
  "{": [".XX", ".X.", "XX.", ".X.", ".XX"],
  "}": ["XX.", ".X.", ".XX", ".X.", "XX."],
  " ": ["..", "..", "..", "..", ".."],
};

function glyph(character: string): SpriteRows {
  return GLYPHS[character.toUpperCase()] ?? GLYPHS["?"];
}

export function textWidth(text: string): number {
  return [...text].reduce(
    (width, character, index) =>
      width + glyph(character)[0].length + (index > 0 ? LETTER_GAP : 0),
    0,
  );
}

export function textRows(text: string, paint: string): string[] {
  let rows = blank(textWidth(text), FONT_HEIGHT);
  let left = 0;
  for (const character of text) {
    const shape = glyph(character).map((row) => row.replaceAll("X", paint));
    rows = stamp(rows, shape, left, 0);
    left += shape[0].length + LETTER_GAP;
  }
  return rows;
}
