import { type CatalogObject, DATABASE, qualifiedName } from "./catalog";

function queryLines(object: CatalogObject): string[] {
  if (object.kind === "procedure") {
    return [`EXEC ${qualifiedName(object)};`];
  }
  const select = `SELECT ${object.columns.map((entry) => entry.name).join(", ")}`;
  const from = `FROM ${qualifiedName(object)}`;
  if (!object.orderBy) {
    return [select, `${from};`];
  }
  const direction = object.orderBy.descending ? " DESC" : "";
  return [select, from, `ORDER BY ${object.orderBy.column}${direction};`];
}

export function sectionQuery(object: CatalogObject): string {
  return queryLines(object).join("\n");
}

export function sectionScript(
  object: CatalogObject,
  comments: readonly string[],
): string {
  return [
    ...comments.map((line) => `-- ${line}`),
    `USE ${DATABASE};`,
    "GO",
    "",
    ...queryLines(object),
  ].join("\n");
}
