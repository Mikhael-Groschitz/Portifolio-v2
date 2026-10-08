import { getTable } from "@/content";
import type { Locale } from "@/content/locales";
import { isPlaceholder } from "@/content/placeholder";
import {
  CATALOG,
  type CatalogColumn,
  type CatalogColumnType,
  type CatalogObject,
  DATABASE,
  qualifiedName,
} from "./catalog";
import { normalize } from "./normalize";
import { sectionQuery, sectionScript } from "./scripts";

export type Cell =
  | { kind: "text"; text: string }
  | { kind: "link"; text: string; href: string; download?: string }
  | { kind: "null" };

export interface ResultColumn {
  name: string;
  type: CatalogColumnType;
}

export interface ResultSet {
  source: string;
  columns: readonly ResultColumn[];
  rows: readonly (readonly Cell[])[];
}

export interface SqlError {
  number: number;
  level: number;
  state: number;
  line: number;
  message: string;
}

export type ExecutionOutcome =
  | { kind: "rows"; database: string; resultSet: ResultSet }
  | { kind: "error"; database: string; error: SqlError };

export interface ExecutionContext {
  locale: Locale;
}

function commandForms(object: CatalogObject): string[] {
  const shortcuts =
    object.kind === "table"
      ? [
          `SELECT * FROM ${qualifiedName(object)}`,
          `SELECT * FROM ${object.name}`,
        ]
      : [`EXEC ${object.name}`];
  return [sectionQuery(object), sectionScript(object, []), ...shortcuts];
}

const COMMANDS = new Map(
  CATALOG.flatMap((object) =>
    commandForms(object).map((form) => [normalize(form), object] as const),
  ),
);

function fieldValue(row: object, field: string): unknown {
  return (row as Record<string, unknown>)[field];
}

function cellOf(row: object, column: CatalogColumn): Cell {
  const value = fieldValue(row, column.field);
  if (value === null || value === undefined) {
    return { kind: "null" };
  }
  const text = Array.isArray(value) ? value.join(", ") : String(value);
  if (column.type === "url" && !isPlaceholder(text)) {
    return { kind: "link", text, href: text };
  }
  if (column.type === "download" && !isPlaceholder(text)) {
    const fileName = column.fileField && fieldValue(row, column.fileField);
    return {
      kind: "link",
      text,
      href: text,
      download: typeof fileName === "string" ? fileName : undefined,
    };
  }
  return { kind: "text", text };
}

function resultSetOf(object: CatalogObject, locale: Locale): ResultSet {
  const rows: readonly object[] = getTable(object.section, locale);
  return {
    source: qualifiedName(object),
    columns: object.columns.map(({ name, type }) => ({ name, type })),
    rows: rows.map((row) =>
      object.columns.map((column) => cellOf(row, column)),
    ),
  };
}

function syntaxError(command: string): SqlError {
  const [nearToken = ""] = command.split(" ");
  return {
    number: 102,
    level: 15,
    state: 1,
    line: 1,
    message: `Incorrect syntax near '${nearToken}'.`,
  };
}

export function execute(
  input: string,
  context: ExecutionContext,
): ExecutionOutcome {
  const command = normalize(input);
  const object = COMMANDS.get(command);
  if (!object) {
    return { kind: "error", database: DATABASE, error: syntaxError(command) };
  }
  return {
    kind: "rows",
    database: DATABASE,
    resultSet: resultSetOf(object, context.locale),
  };
}
