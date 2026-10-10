import type { ContainerKind, DropKind, RelicKind } from "../entities/items";
import {
  type Cell,
  type Level,
  TILE,
  isIndoors,
  isSolid,
} from "../levels/level";
import { COLORS, PALETTE } from "../palette";
import { fogRows, moonRows, skyRows, towerLights, towerRows } from "./backdrop";
import {
  DOOR,
  GARGOYLE,
  GARGOYLE_EYES,
  GATE,
  GATE_SPRINGLINE,
  LOG_PANEL,
  MERLON,
  WALL,
  WINDOW,
  type Led,
  doorPlaque,
  ledPhase,
  tileArt,
} from "./castle-art";
import {
  COLLECTOR_ART,
  COLLECTOR_CRUMBLE,
  type CollectorPoseName,
  SLASH_ARC,
} from "./collector-art";
import {
  SQUIGGLE_ART,
  SYNTAX_ERROR_ART,
  SYNTAX_ERROR_COLLAPSE,
  SYNTAX_ERROR_DAMAGED_ART,
  type SyntaxErrorPose,
  WATCHDOG_ART,
  WATCHDOG_DAMAGED_ART,
} from "./enemy-art";
import { HERO_ART, HERO_FRAMES, type HeroArtFrame } from "./hero-art";
import {
  BEAMS,
  BIG_ENERGY,
  DISK,
  ENERGY,
  GC_CHIP,
  GLYPH_SHOTS,
  JOIN_RELIC,
  JOIN_SPIN,
  PEN,
  SELECT_BOLT,
  TRUNCATE_RELIC,
} from "./item-art";
import {
  COMMAND_LABELS,
  type Command,
  FACES,
  type Face,
  HOTFIX_NOTE,
  LEGACY_ART,
  type LegacyPoseName,
  PUNCHED_CARDS,
  REEL_FRAMES,
  THRONE,
  THRONE_FRAME,
  THRONE_LEDS,
} from "./legacy-art";
import { titleRows } from "./lettering";
import { type SpriteRows, mirror, silhouette, toCanvas } from "./sprite";

export interface Light {
  x: number;
  y: number;
  on: string;
  off: string;
  phase: number;
}

export type Facing = readonly [
  right: HTMLCanvasElement,
  left: HTMLCanvasElement,
];

export interface Spot {
  x: number;
  y: number;
}

export interface RoomArt {
  canvas: HTMLCanvasElement;
  lights: readonly Light[];
  battlements: HTMLCanvasElement | null;
  roofStart: number;
  entry: Spot | null;
  exit: Spot | null;
  throne: Spot | null;
}

export interface Art {
  hero: Readonly<Record<HeroArtFrame, Facing>>;
  plug: Facing;
  syntaxError: Readonly<Record<SyntaxErrorPose, Facing>>;
  syntaxErrorDamaged: Readonly<Record<SyntaxErrorPose, Facing>>;
  squiggle: readonly HTMLCanvasElement[];
  collapse: readonly Facing[];
  watchdog: Readonly<Record<string, Facing>>;
  watchdogDamaged: Readonly<Record<string, Facing>>;
  collector: Readonly<Record<CollectorPoseName, Facing>>;
  collectorGlow: Readonly<Record<CollectorPoseName, Facing>>;
  crumble: readonly HTMLCanvasElement[];
  slashArc: Facing;
  legacy: Readonly<Record<LegacyPoseName, Facing>>;
  legacyGlow: Readonly<Record<LegacyPoseName, Facing>>;
  faces: Readonly<Record<Face, HTMLCanvasElement>>;
  hotfix: HTMLCanvasElement;
  reels: readonly HTMLCanvasElement[];
  commands: Readonly<Record<Command, HTMLCanvasElement>>;
  containers: Readonly<Record<ContainerKind, HTMLCanvasElement>>;
  drops: Readonly<Record<DropKind, HTMLCanvasElement>>;
  relics: Readonly<Record<RelicKind, HTMLCanvasElement>>;
  select: Facing;
  join: readonly HTMLCanvasElement[];
  glyphs: readonly HTMLCanvasElement[];
  beams: readonly HTMLCanvasElement[];
  cards: readonly HTMLCanvasElement[];
  rooms: readonly RoomArt[];
  sky: HTMLCanvasElement;
  moon: HTMLCanvasElement;
  towers: HTMLCanvasElement;
  towerLights: readonly { x: number; y: number }[];
  fog: HTMLCanvasElement;
  title: HTMLCanvasElement;
}

const PLUG = [".kkkkk.", "kc8wwwy", "kc8wwwy", ".kkkkk."];
const GLOW = "w";

function paint(key: string): string {
  return COLORS[PALETTE[key]];
}

function facing(rows: SpriteRows): Facing {
  return [toCanvas(rows), toCanvas(mirror(rows))];
}

function facingSet<K extends string>(
  frames: Readonly<Record<K, SpriteRows>>,
): Record<K, Facing> {
  return Object.fromEntries(
    Object.entries<SpriteRows>(frames).map(([frame, rows]) => [
      frame,
      facing(rows),
    ]),
  ) as Record<K, Facing>;
}

function canvasSet<K extends string>(
  frames: Readonly<Record<K, SpriteRows>>,
): Record<K, HTMLCanvasElement> {
  return Object.fromEntries(
    Object.entries<SpriteRows>(frames).map(([frame, rows]) => [
      frame,
      toCanvas(rows),
    ]),
  ) as Record<K, HTMLCanvasElement>;
}

function painter(context: CanvasRenderingContext2D) {
  const cache = new Map<SpriteRows, HTMLCanvasElement>();
  return (rows: SpriteRows, x: number, y: number) => {
    let canvas = cache.get(rows);
    if (!canvas) {
      canvas = toCanvas(rows);
      cache.set(rows, canvas);
    }
    context.drawImage(canvas, x, y);
  };
}

function lightsOf(
  leds: readonly Led[],
  x: number,
  y: number,
  phase: (index: number) => number,
): Light[] {
  return leds.map((led, index) => ({
    x: x + led.x,
    y: y + led.y,
    on: paint(led.on),
    off: paint(led.off),
    phase: phase(index),
  }));
}

function doorAt(cell: Cell): Spot {
  return { x: cell.column * TILE, y: (cell.row + 1) * TILE - DOOR.length };
}

function throneAt(cell: Cell): Spot {
  return {
    x: cell.column * TILE + TILE / 2 - THRONE_FRAME.width / 2,
    y: (cell.row + 1) * TILE - THRONE_FRAME.height,
  };
}

function paintTiles(
  level: Level,
  draw: ReturnType<typeof painter>,
  lights: Light[],
): void {
  for (let row = 0; row < level.rows; row++) {
    for (let column = 0; column < level.columns; column++) {
      const x = column * TILE;
      const y = row * TILE;
      if (isIndoors(level, column) && !isSolid(level, column, row)) {
        draw(WALL, x, y);
      }
      const art = tileArt(level, column, row);
      if (art) {
        draw(art.rows, x, y);
        lights.push(
          ...lightsOf(art.leds, x, y, (index) => ledPhase(column, row, index)),
        );
      }
    }
  }
}

function paintDecor(
  level: Level,
  draw: ReturnType<typeof painter>,
  lights: Light[],
): void {
  const { places } = level;
  for (const { column, row } of places.window) {
    draw(WINDOW, column * TILE, row * TILE);
  }
  for (const { column, row } of places.log) {
    draw(LOG_PANEL, column * TILE, row * TILE);
  }
  for (const { column, row } of places.gargoyle) {
    draw(GARGOYLE, column * TILE, row * TILE);
    lights.push(
      ...lightsOf(GARGOYLE_EYES, column * TILE, row * TILE, () =>
        ledPhase(column, row, 0),
      ),
    );
  }
  for (const { column, row } of [...places.gate, ...places.arch]) {
    draw(GATE, column * TILE, row * TILE - GATE_SPRINGLINE);
  }
}

function paintEntry(
  level: Level,
  entered: boolean,
  draw: ReturnType<typeof painter>,
): Spot | null {
  if (!entered) {
    return null;
  }
  const entry = doorAt(level.start);
  draw(DOOR, entry.x, entry.y);
  return entry;
}

function paintExit(
  level: Level,
  draw: ReturnType<typeof painter>,
): Spot | null {
  if (!level.exit) {
    return null;
  }
  const exit = doorAt(level.exit);
  draw(DOOR, exit.x, exit.y);
  if (level.plaque) {
    const plaque = doorPlaque(level.plaque);
    draw(
      plaque,
      exit.x + (DOOR[0].length - plaque[0].length) / 2,
      exit.y - plaque.length - 2,
    );
  }
  return exit;
}

function paintThrone(
  level: Level,
  draw: ReturnType<typeof painter>,
  lights: Light[],
): Spot | null {
  const [seat] = level.places.throne;
  if (!seat) {
    return null;
  }
  const throne = throneAt(seat);
  draw(THRONE, throne.x, throne.y);
  THRONE_LEDS.forEach(([x, y], index) => {
    lights.push({
      x: throne.x + x,
      y: throne.y + y,
      on: COLORS.gold,
      off: COLORS.metalDark,
      phase: index * 23,
    });
  });
  return throne;
}

function paintBattlements(width: number): HTMLCanvasElement {
  const merlon = toCanvas(MERLON);
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = MERLON.length;
  const context = canvas.getContext("2d");
  for (let x = 0; x < width; x += merlon.width) {
    context?.drawImage(merlon, x, 0);
  }
  return canvas;
}

function paintRoom(level: Level, index: number): RoomArt {
  const canvas = document.createElement("canvas");
  canvas.width = level.width;
  canvas.height = level.height;
  const context = canvas.getContext("2d");
  const lights: Light[] = [];
  const roofStart = level.gate ? level.gate.column * TILE : 0;
  const battlements = level.gate
    ? paintBattlements(level.width - roofStart)
    : null;
  const room: RoomArt = {
    canvas,
    lights,
    battlements,
    roofStart,
    entry: null,
    exit: null,
    throne: null,
  };
  if (!context) {
    return room;
  }
  const draw = painter(context);
  paintTiles(level, draw, lights);
  paintDecor(level, draw, lights);
  room.entry = paintEntry(level, index > 0, draw);
  room.exit = paintExit(level, draw);
  room.throne = paintThrone(level, draw, lights);
  return room;
}

function glowSet<K extends string>(
  frames: Readonly<Record<K, readonly [SpriteRows, SpriteRows]>>,
): Record<K, Facing> {
  return Object.fromEntries(
    Object.entries<readonly [SpriteRows, SpriteRows]>(frames).map(
      ([frame, [right, left]]) => [
        frame,
        [
          toCanvas(silhouette(right, GLOW)),
          toCanvas(silhouette(left, GLOW)),
        ] as const,
      ],
    ),
  ) as Record<K, Facing>;
}

function pairSet<K extends string>(
  frames: Readonly<Record<K, readonly [SpriteRows, SpriteRows]>>,
): Record<K, Facing> {
  return Object.fromEntries(
    Object.entries<readonly [SpriteRows, SpriteRows]>(frames).map(
      ([frame, [right, left]]) => [
        frame,
        [toCanvas(right), toCanvas(left)] as const,
      ],
    ),
  ) as Record<K, Facing>;
}

function legacyPairs(): Record<LegacyPoseName, readonly [string[], string[]]> {
  return Object.fromEntries(
    Object.entries(LEGACY_ART).map(([pose, { rows }]) => [
      pose,
      [rows, mirror(rows)] as const,
    ]),
  ) as Record<LegacyPoseName, readonly [string[], string[]]>;
}

export function createArt(levels: readonly Level[]): Art {
  const legacy = legacyPairs();
  return {
    hero: Object.fromEntries(
      HERO_FRAMES.map((frame) => [frame, facing(HERO_ART[frame])]),
    ) as Record<HeroArtFrame, Facing>,
    plug: facing(PLUG),
    syntaxError: facingSet(SYNTAX_ERROR_ART),
    syntaxErrorDamaged: facingSet(SYNTAX_ERROR_DAMAGED_ART),
    squiggle: SQUIGGLE_ART.map(toCanvas),
    collapse: SYNTAX_ERROR_COLLAPSE.map(facing),
    watchdog: facingSet(WATCHDOG_ART),
    watchdogDamaged: facingSet(WATCHDOG_DAMAGED_ART),
    collector: pairSet(COLLECTOR_ART),
    collectorGlow: glowSet(COLLECTOR_ART),
    crumble: COLLECTOR_CRUMBLE.map(toCanvas),
    slashArc: facing(SLASH_ARC),
    legacy: pairSet(legacy),
    legacyGlow: glowSet(legacy),
    faces: canvasSet(FACES),
    hotfix: toCanvas(HOTFIX_NOTE),
    reels: REEL_FRAMES.map(toCanvas),
    commands: canvasSet(COMMAND_LABELS),
    containers: { disk: toCanvas(DISK), pen: toCanvas(PEN) },
    drops: {
      energy: toCanvas(ENERGY),
      bigEnergy: toCanvas(BIG_ENERGY),
      gc: toCanvas(GC_CHIP),
    },
    relics: { join: toCanvas(JOIN_RELIC), truncate: toCanvas(TRUNCATE_RELIC) },
    select: facing(SELECT_BOLT),
    join: JOIN_SPIN.map(toCanvas),
    glyphs: GLYPH_SHOTS.map(toCanvas),
    beams: BEAMS.map(toCanvas),
    cards: PUNCHED_CARDS.map(toCanvas),
    rooms: levels.map(paintRoom),
    sky: toCanvas(skyRows()),
    moon: toCanvas(moonRows()),
    towers: toCanvas(towerRows()),
    towerLights: towerLights(),
    fog: toCanvas(fogRows()),
    title: toCanvas(titleRows()),
  };
}
