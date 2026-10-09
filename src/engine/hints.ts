import { CATALOG, type CatalogObject, qualifiedName } from "./catalog";

export interface QueryHint {
  command: string;
  similar: boolean;
}

const MAX_DISTANCE = 2;
const MIN_PARTIAL_LENGTH = 4;

export function editDistance(a: string, b: string): number {
  let previous = Array.from({ length: b.length + 1 }, (_, index) => index);
  for (let i = 1; i <= a.length; i++) {
    const current = [i];
    for (let j = 1; j <= b.length; j++) {
      const substitution = previous[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1);
      current.push(Math.min(previous[j] + 1, current[j - 1] + 1, substitution));
    }
    previous = current;
  }
  return previous[b.length];
}

export function commandFor(object: CatalogObject): string {
  return object.kind === "table"
    ? `SELECT * FROM ${qualifiedName(object)}`
    : `EXEC ${qualifiedName(object)}`;
}

function resembles(word: string, name: string): boolean {
  if (word === name) {
    return true;
  }
  return (
    word.length >= MIN_PARTIAL_LENGTH &&
    (name.startsWith(word) || editDistance(word, name) <= MAX_DISTANCE)
  );
}

export function hintFor(statement: string): QueryHint {
  const words = statement
    .toLowerCase()
    .split(/[^\p{L}\p{N}_]+/u)
    .filter(Boolean);
  const similar = CATALOG.find((object) =>
    words.some((word) => resembles(word, object.name.toLowerCase())),
  );
  return similar
    ? { command: commandFor(similar), similar: true }
    : { command: commandFor(CATALOG[0]), similar: false };
}
