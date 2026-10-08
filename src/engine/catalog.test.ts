import { describe, expect, it } from "vitest";
import { getTable } from "@/content";
import { LOCALES } from "@/content/locales";
import { SECTION_IDS } from "@/content/types";
import {
  CATALOG,
  catalogIdentifiers,
  catalogObject,
  qualifiedName,
} from "./catalog";

describe("catalog", () => {
  it("has exactly one object per section, in the section order", () => {
    expect(CATALOG.map((object) => object.section)).toEqual([...SECTION_IDS]);
  });

  it("keeps object names unique", () => {
    const names = CATALOG.map((object) => object.name.toLowerCase());
    expect(new Set(names).size).toBe(names.length);
  });

  it("names objects with the dbo schema", () => {
    expect(qualifiedName(catalogObject("about"))).toBe("dbo.About");
    expect(qualifiedName(catalogObject("resume"))).toBe("dbo.sp_DownloadCV");
  });

  it("maps every column to a field of the section rows", () => {
    for (const object of CATALOG) {
      for (const locale of LOCALES) {
        for (const row of getTable(object.section, locale)) {
          for (const { name, field } of object.columns) {
            expect(Object.hasOwn(row, field), `${object.name}.${name}`).toBe(
              true,
            );
          }
        }
      }
    }
  });

  it("lists the names the editor should color as identifiers", () => {
    const identifiers = catalogIdentifiers();
    for (const name of ["Portfolio", "dbo", "Career", "Role", "SortOrder"]) {
      expect(identifiers.has(name), name).toBe(true);
    }
    expect(identifiers.has("SELECT")).toBe(false);
  });
});
