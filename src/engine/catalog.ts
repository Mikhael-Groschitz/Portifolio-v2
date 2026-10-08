import type { SectionId } from "@/content/types";

export const SERVER = {
  name: "mgroschitz.dev",
  product: "Portfolio Server",
  version: "2.0",
} as const;

export const DATABASE = "Portfolio";

export const SCHEMA = "dbo";

export type CatalogObjectKind = "table" | "procedure";

export interface CatalogObject {
  section: SectionId;
  kind: CatalogObjectKind;
  name: string;
}

export const CATALOG: readonly CatalogObject[] = [
  { section: "about", kind: "table", name: "About" },
  { section: "tech-stack", kind: "table", name: "TechStack" },
  { section: "career", kind: "table", name: "Career" },
  { section: "projects", kind: "table", name: "Projects" },
  { section: "contact", kind: "table", name: "Contact" },
  { section: "resume", kind: "procedure", name: "sp_DownloadCV" },
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
