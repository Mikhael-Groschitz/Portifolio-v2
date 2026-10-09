import type { CompletionKind } from "@/content/types";
import { CATALOG, DATABASE, SCHEMA, qualifiedName } from "@/engine/catalog";

export interface CompletionItem {
  label: string;
  kind: CompletionKind;
  owner: string | null;
}

export interface Completion {
  items: readonly CompletionItem[];
  from: number;
  to: number;
}

const SYSTEM_SCHEMA = "sys";
const MIN_INFIX_LENGTH = 3;

const KEYWORDS: readonly CompletionItem[] = [
  "SELECT",
  "FROM",
  "EXEC",
  "USE",
  "HELP",
].map((label) => ({ label, kind: "keyword", owner: null }));

const TABLES: readonly CompletionItem[] = CATALOG.filter(
  (object) => object.kind === "table",
).map((object) => ({
  label: qualifiedName(object),
  kind: "table",
  owner: SCHEMA,
}));

const PROCEDURES: readonly CompletionItem[] = [
  ...CATALOG.filter((object) => object.kind === "procedure").map(
    (object): CompletionItem => ({
      label: qualifiedName(object),
      kind: "procedure",
      owner: SCHEMA,
    }),
  ),
  { label: "sp_help", kind: "procedure", owner: SYSTEM_SCHEMA },
];

const DATABASES: readonly CompletionItem[] = [
  { label: DATABASE, kind: "database", owner: null },
];

const CANDIDATES_AFTER: Record<string, readonly CompletionItem[]> = {
  from: TABLES,
  exec: PROCEDURES,
  execute: PROCEDURES,
  use: DATABASES,
};

const EVERYTHING = [...KEYWORDS, ...TABLES, ...PROCEDURES];

const WORD_CHARACTER = /[\p{L}\p{N}_.@#$]/u;
const KEYWORD_CHARACTER = /[\p{L}\p{N}_]/u;
const SPACE = /\s/;

export function isWordCharacter(character: string): boolean {
  return WORD_CHARACTER.test(character);
}

function startOfRun(text: string, end: number, pattern: RegExp): number {
  let index = end;
  while (index > 0 && pattern.test(text[index - 1])) {
    index--;
  }
  return index;
}

function previousWord(text: string, before: number): string {
  const end = startOfRun(text, before, SPACE);
  return text
    .slice(startOfRun(text, end, KEYWORD_CHARACTER), end)
    .toLowerCase();
}

function shortName(label: string): string {
  return label.slice(label.lastIndexOf(".") + 1);
}

function rank(item: CompletionItem, prefix: string): number {
  const label = item.label.toLowerCase();
  if (label.startsWith(prefix) || shortName(label).startsWith(prefix)) {
    return 0;
  }
  return prefix.length >= MIN_INFIX_LENGTH && label.includes(prefix) ? 1 : -1;
}

export function completionAt(
  text: string,
  caret: number,
  explicit = false,
): Completion | null {
  const from = startOfRun(text, caret, WORD_CHARACTER);
  const prefix = text.slice(from, caret).toLowerCase();
  const contextual = CANDIDATES_AFTER[previousWord(text, from)];
  if (!prefix && !explicit && !contextual) {
    return null;
  }
  const candidates = contextual ?? EVERYTHING;
  const items = prefix
    ? candidates
        .map((item) => ({ item, rank: rank(item, prefix) }))
        .filter((ranked) => ranked.rank >= 0)
        .sort((a, b) => a.rank - b.rank)
        .map((ranked) => ranked.item)
    : candidates;
  return items.length > 0 ? { items, from, to: caret } : null;
}
