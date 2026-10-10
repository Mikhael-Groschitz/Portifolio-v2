export const TILE = 16;

export const TERRAIN = {
  air: 0,
  stone: 1,
  rack: 2,
  ledge: 3,
} as const;

export type Terrain = (typeof TERRAIN)[keyof typeof TERRAIN];

export interface Cell {
  column: number;
  row: number;
}

const TERRAIN_SYMBOLS: Readonly<Record<string, Terrain>> = {
  " ": TERRAIN.air,
  "#": TERRAIN.stone,
  R: TERRAIN.rack,
  "=": TERRAIN.ledge,
};

const MARKERS = {
  S: "start",
  E: "exit",
  D: "gate",
  A: "arch",
  C: "checkpoint",
  W: "window",
  G: "gargoyle",
  L: "log",
  x: "syntaxError",
  o: "watchdog",
  f: "disk",
  u: "pen",
  j: "join",
  t: "truncate",
  B: "collector",
  T: "throne",
  s: "summon",
} as const;

export type Place = (typeof MARKERS)[keyof typeof MARKERS];

export interface Level {
  columns: number;
  rows: number;
  width: number;
  height: number;
  terrain: readonly Terrain[];
  start: Cell;
  exit: Cell | null;
  gate: Cell | null;
  plaque: string | null;
  places: Readonly<Record<Place, readonly Cell[]>>;
}

function isMarker(symbol: string): symbol is keyof typeof MARKERS {
  return Object.hasOwn(MARKERS, symbol);
}

function single(cells: readonly Cell[], symbol: string): Cell {
  if (cells.length !== 1) {
    throw new Error(
      `The map needs exactly one "${symbol}", found ${cells.length}`,
    );
  }
  return cells[0];
}

function optional(cells: readonly Cell[], symbol: string): Cell | null {
  if (cells.length > 1) {
    throw new Error(
      `The map allows at most one "${symbol}", found ${cells.length}`,
    );
  }
  return cells[0] ?? null;
}

export function joinSegments(
  ...segments: readonly (readonly string[])[]
): string[] {
  const rows = segments[0]?.length ?? 0;
  for (const segment of segments) {
    if (segment.length !== rows) {
      throw new Error(`Segments need ${rows} rows, found ${segment.length}`);
    }
  }
  return Array.from({ length: rows }, (_, row) =>
    segments.map((segment) => segment[row]).join(""),
  );
}

export function parseLevel(
  map: readonly string[],
  plaque: string | null = null,
): Level {
  const columns = map[0]?.length ?? 0;
  if (columns === 0) {
    throw new Error("The map is empty");
  }
  const places = Object.fromEntries(
    Object.values(MARKERS).map((place) => [place, [] as Cell[]]),
  ) as Record<Place, Cell[]>;
  const terrain: Terrain[] = [];
  map.forEach((line, row) => {
    if (line.length !== columns) {
      throw new Error(
        `Row ${row} has ${line.length} columns instead of ${columns}`,
      );
    }
    [...line].forEach((symbol, column) => {
      if (isMarker(symbol)) {
        places[MARKERS[symbol]].push({ column, row });
        terrain.push(TERRAIN.air);
      } else if (Object.hasOwn(TERRAIN_SYMBOLS, symbol)) {
        terrain.push(TERRAIN_SYMBOLS[symbol]);
      } else {
        throw new Error(`Unknown symbol "${symbol}" at ${column},${row}`);
      }
    });
  });
  optional(places.collector, "B");
  optional(places.throne, "T");
  return {
    columns,
    rows: map.length,
    width: columns * TILE,
    height: map.length * TILE,
    terrain,
    start: single(places.start, "S"),
    exit: optional(places.exit, "E"),
    gate: optional(places.gate, "D"),
    plaque,
    places,
  };
}

export function terrainAt(level: Level, column: number, row: number): Terrain {
  if (column < 0 || column >= level.columns) {
    return TERRAIN.stone;
  }
  if (row < 0 || row >= level.rows) {
    return TERRAIN.air;
  }
  return level.terrain[row * level.columns + column];
}

export function isSolid(level: Level, column: number, row: number): boolean {
  const terrain = terrainAt(level, column, row);
  return terrain === TERRAIN.stone || terrain === TERRAIN.rack;
}

export function isFloor(level: Level, column: number, row: number): boolean {
  return (
    isSolid(level, column, row) ||
    terrainAt(level, column, row) === TERRAIN.ledge
  );
}

export function isIndoors(level: Level, column: number): boolean {
  return level.gate === null || column >= level.gate.column;
}
