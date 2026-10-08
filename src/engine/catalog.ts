import type { SectionId } from "@/content/types";

export const SERVER = {
  name: "mgroschitz.dev",
  product: "Portfolio Server",
  version: "2.0",
} as const;

export const DATABASE = "Portfolio";

export const SCHEMA = "dbo";

export type CatalogObjectKind = "table" | "procedure";

export interface CatalogColumn {
  name: string;
  field: string;
}

export interface CatalogOrder {
  column: string;
  descending?: boolean;
}

export interface CatalogObject {
  section: SectionId;
  kind: CatalogObjectKind;
  name: string;
  columns: readonly CatalogColumn[];
  orderBy?: CatalogOrder;
}

function column(name: string, field: string): CatalogColumn {
  return { name, field };
}

export const CATALOG: readonly CatalogObject[] = [
  {
    section: "about",
    kind: "table",
    name: "About",
    columns: [
      column("Name", "name"),
      column("Role", "role"),
      column("Summary", "summary"),
    ],
  },
  {
    section: "tech-stack",
    kind: "table",
    name: "TechStack",
    columns: [
      column("Category", "category"),
      column("Technology", "technology"),
    ],
    orderBy: { column: "SortOrder" },
  },
  {
    section: "career",
    kind: "table",
    name: "Career",
    columns: [
      column("Company", "company"),
      column("Role", "role"),
      column("StartDate", "startDate"),
      column("EndDate", "endDate"),
      column("Description", "description"),
    ],
    orderBy: { column: "StartDate", descending: true },
  },
  {
    section: "projects",
    kind: "table",
    name: "Projects",
    columns: [
      column("Name", "name"),
      column("Category", "categories"),
      column("Description", "description"),
      column("Stack", "stack"),
      column("RepoUrl", "repoUrl"),
      column("DemoUrl", "demoUrl"),
    ],
  },
  {
    section: "beyond-the-terminal",
    kind: "table",
    name: "BeyondTheTerminal",
    columns: [column("Trait", "trait"), column("Description", "description")],
  },
  {
    section: "contact",
    kind: "table",
    name: "Contact",
    columns: [
      column("Channel", "channel"),
      column("Value", "value"),
      column("Url", "url"),
    ],
  },
  {
    section: "resume",
    kind: "procedure",
    name: "sp_DownloadCV",
    columns: [column("FileName", "fileName"), column("Url", "url")],
  },
];

export function qualifiedName(object: CatalogObject): string {
  return `${SCHEMA}.${object.name}`;
}

export function catalogObject(section: SectionId): CatalogObject {
  const object = CATALOG.find((entry) => entry.section === section);
  if (!object) {
    throw new Error(`No catalog object for section "${section}"`);
  }
  return object;
}

export function catalogIdentifiers(): Set<string> {
  return new Set([
    DATABASE,
    SCHEMA,
    ...CATALOG.flatMap((object) => [
      object.name,
      ...object.columns.map((entry) => entry.name),
      ...(object.orderBy ? [object.orderBy.column] : []),
    ]),
  ]);
}
