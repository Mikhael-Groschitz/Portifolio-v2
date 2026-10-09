import { getTable, getTexts } from "@/content";
import type { Locale } from "@/content/locales";
import { isPlaceholder } from "@/content/placeholder";
import {
  CATALOG,
  type CatalogColumn,
  type CatalogColumnType,
  type CatalogObject,
  type CatalogObjectKind,
  DATABASE,
  SCHEMA,
  objectReferences,
  qualifiedName,
} from "./catalog";
import {
  EASTER_EGGS,
  type EasterEggContext,
  type EasterEggOutcome,
  type Effect,
  databaseAfter,
} from "./easter-eggs";
import { ERROR_LEVEL, ERROR_STATE, pickError } from "./errors";
import { type QueryHint, commandFor, hintFor } from "./hints";
import {
  type Statement,
  normalizeStatement,
  splitStatements,
} from "./normalize";
import { sectionQuery } from "./scripts";

export const MAX_QUERY_LENGTH = 10_000;

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

export type StatementResult =
  { kind: "rows"; resultSet: ResultSet } | { kind: "done" };

export type ExecutionOutcome =
  | {
      kind: "results";
      database: string;
      results: readonly StatementResult[];
      effect?: Effect;
    }
  | { kind: "error"; database: string; error: SqlError; hint: QueryHint };

export interface ExecutionContext {
  locale: Locale;
  random?: () => number;
  now?: Date;
  v1Available?: boolean;
}

type Command = (locale: Locale) => StatementResult[];

const OBJECT_TYPES: Record<CatalogObjectKind, string> = {
  table: "user table",
  procedure: "stored procedure",
};

const HELP_FORMS = [
  "HELP",
  "sp_help",
  "EXEC sp_help",
  "EXECUTE sp_help",
  "EXEC sys.sp_help",
  "EXECUTE sys.sp_help",
];

function textCell(text: string): Cell {
  return { kind: "text", text };
}

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
  return textCell(text);
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

function helpResults(locale: Locale): StatementResult[] {
  const descriptions = getTexts(locale).shell.query.help;
  const objects: ResultSet = {
    source: "sp_help",
    columns: [
      { name: "Name", type: "text" },
      { name: "Owner", type: "text" },
      { name: "Object_type", type: "text" },
    ],
    rows: CATALOG.map((object) => [
      textCell(object.name),
      textCell(SCHEMA),
      textCell(OBJECT_TYPES[object.kind]),
    ]),
  };
  const commands: ResultSet = {
    source: "HELP",
    columns: [
      { name: "Command", type: "text" },
      { name: "Description", type: "long" },
    ],
    rows: [
      ...CATALOG.map((object) => [
        textCell(commandFor(object)),
        textCell(descriptions.objects[object.section]),
      ]),
      [textCell(`USE ${DATABASE}`), textCell(descriptions.use)],
      [textCell("EXEC sp_help"), textCell(descriptions.spHelp)],
      [textCell("HELP"), textCell(descriptions.help)],
    ],
  };
  return [
    { kind: "rows", resultSet: objects },
    { kind: "rows", resultSet: commands },
  ];
}

function objectForms(object: CatalogObject): string[] {
  const targets = objectReferences(object.name);
  if (object.kind === "procedure") {
    return targets.flatMap((target) => [
      target,
      `EXEC ${target}`,
      `EXECUTE ${target}`,
    ]);
  }
  return [
    sectionQuery(object),
    ...targets.map((target) => `SELECT * FROM ${target}`),
  ];
}

function entries(
  forms: readonly string[],
  command: Command,
): [string, Command][] {
  return forms.map((form) => [normalizeStatement(form), command]);
}

const COMMANDS = new Map<string, Command>([
  ...CATALOG.flatMap((object) =>
    entries(objectForms(object), (locale) => [
      { kind: "rows", resultSet: resultSetOf(object, locale) },
    ]),
  ),
  ...entries([`USE ${DATABASE}`], () => [{ kind: "done" }]),
  ...entries(HELP_FORMS, helpResults),
]);

function failure(
  statement: Statement,
  { locale, random = Math.random }: ExecutionContext,
): ExecutionOutcome {
  const entry = pickError(random);
  return {
    kind: "error",
    database: DATABASE,
    error: {
      number: entry.code,
      level: ERROR_LEVEL,
      state: ERROR_STATE,
      line: statement.line,
      message: entry.text[locale],
    },
    hint: hintFor(statement.text),
  };
}

function easterEggFailure(
  statement: Statement,
  { error, hint }: Extract<EasterEggOutcome, { kind: "error" }>,
  locale: Locale,
): ExecutionOutcome {
  return {
    kind: "error",
    database: DATABASE,
    error: {
      number: error.code,
      level: error.level,
      state: error.state,
      line: statement.line,
      message: error.text[locale],
    },
    hint,
  };
}

export function execute(
  input: string,
  context: ExecutionContext,
): ExecutionOutcome {
  if (input.length > MAX_QUERY_LENGTH) {
    return failure({ text: "", line: 1 }, context);
  }
  const { locale, now, v1Available = false } = context;
  const easterEggContext: EasterEggContext = {
    now,
    v1Available,
    run: (statement) =>
      COMMANDS.get(normalizeStatement(statement))?.(locale) ?? [],
  };
  const results: StatementResult[] = [];
  let effect: Effect | undefined;
  for (const statement of splitStatements(input)) {
    const command = COMMANDS.get(statement.text);
    if (command) {
      results.push(...command(locale));
      continue;
    }
    const easterEgg = EASTER_EGGS.find((entry) => entry.match(statement.text));
    if (!easterEgg) {
      return failure(statement, context);
    }
    const outcome = easterEgg.run(statement.text, easterEggContext);
    if (outcome.kind === "error") {
      return easterEggFailure(statement, outcome, locale);
    }
    results.push(...outcome.results);
    effect = outcome.effect ?? effect;
    if (effect === "travel") {
      break;
    }
  }
  return {
    kind: "results",
    database: databaseAfter(effect),
    results,
    ...(effect && { effect }),
  };
}

export function resultSetsOf(outcome: ExecutionOutcome): ResultSet[] {
  if (outcome.kind === "error") {
    return [];
  }
  return outcome.results.flatMap((result) =>
    result.kind === "rows" ? [result.resultSet] : [],
  );
}

export function rowCountOf(outcome: ExecutionOutcome): number {
  return resultSetsOf(outcome).reduce(
    (total, resultSet) => total + resultSet.rows.length,
    0,
  );
}
