import { GLYPHS, textRows } from "./font";
import { type SpriteRows, blank, outline, pad, stamp } from "./sprite";

function framed(rows: SpriteRows): string[] {
  return outline(pad(rows));
}

function enlarge(rows: SpriteRows): string[] {
  return rows.flatMap((row) => {
    const wide = [...row].map((pixel) => pixel.repeat(2)).join("");
    return [wide, wide];
  });
}

export const DISK = framed([
  "bbbbbbbbbbb.",
  "bb888888bbbb",
  "bb8kk888bbbb",
  "bb8kk888bbbb",
  "bb888888bbbb",
  "bbbbbbbbbbbb",
  "bbwwwwwwwwbb",
  "bbwsssssswbb",
  "bbwwwwwwwwbb",
  "bbwsssswwwbb",
  "bbwwwwwwwwbb",
  "bbbbbbbbbbbb",
]);

export const PEN = framed([
  "vvvvvvvvv888",
  "vwwwvvvvv8k8",
  "vvvvvvgvv888",
  "vvvvvvvvv8k8",
  "vvvvvvvvv888",
]);

export const ENERGY = framed(["..c..", ".cwc.", "cwwwc", ".cbc.", "..c.."]);

export const BIG_ENERGY = framed([
  "....c....",
  "...cwc...",
  "..cwwwc..",
  ".cwwywwc.",
  "cwwyyywwc",
  ".cbbybbc.",
  "..cbbbc..",
  "...cbc...",
  "....c....",
]);

export const GC_CHIP = framed([
  "...gggg...",
  ".gwwwwwwg.",
  "gggggggggg",
  ".g.g..g.g.",
  ".g.g..g.g.",
  ".g.g..g.g.",
  ".g.g..g.g.",
  ".gggggggg.",
]);

const BOWTIE = [
  "v........v",
  "vv......vv",
  "vwv....vwv",
  "vvwv..vwvv",
  "vvvvvvvvvv",
  "vvvvvvvvvv",
  "vvwv..vwvv",
  "vwv....vwv",
  "vv......vv",
  "v........v",
];

const STANDING_BOWTIE = BOWTIE.map((_, y) =>
  BOWTIE.map((row) => row[y]).join(""),
);

const PEDESTAL = [
  "..55555555..",
  "..44444444..",
  "...333333...",
  "..44444444..",
];

const TABLE = [
  "wwwwwwwwwwww",
  "w8888w8888ww",
  "wwwwwwwwwwww",
  "w8888w8888ww",
  "wwwwwwwwwwww",
  "w8888w8888ww",
  "wwwwwwwwwwww",
];

const CUT = [
  "..........RR",
  "........RRR.",
  "......RRR...",
  "....RRR.....",
  "..RRR.......",
  "RRR.........",
];

function relic(icon: SpriteRows): string[] {
  let rows = blank(16, 18);
  rows = stamp(rows, icon, Math.floor((16 - icon[0].length) / 2), 1);
  rows = stamp(rows, PEDESTAL, 2, 13);
  return outline(rows);
}

export const JOIN_RELIC = relic(BOWTIE);
export const TRUNCATE_RELIC = relic(stamp(TABLE, CUT, 0, 1));

export const SELECT_BOLT = framed([
  "bbccccw...",
  "bccccccwww",
  "bccccccwww",
  "bbccccw...",
]);

export const JOIN_SPIN = [framed(BOWTIE), framed(STANDING_BOWTIE)] as const;

export const GLYPH_SHOTS = [";", ")", "}"].map((glyph) =>
  framed(enlarge(GLYPHS[glyph].map((row) => row.replaceAll("X", "s")))),
);

export const BEAMS = [
  framed(textRows("WARN", "y")),
  framed(textRows("ERROR", "R")),
];

export const SPARK_PAINT = {
  bone: "w",
  plastic: "b",
  glass: "v",
  data: "c",
  ember: "R",
  impact: "y",
  card: "o",
} as const;
