import { describe, expect, it } from "vitest";
import { SECTION_IDS } from "@/content/types";
import { CATALOG, catalogObject, qualifiedName } from "./catalog";

describe("catalog", () => {
  it("has exactly one object per section", () => {
    expect(CATALOG.map((object) => object.section).sort()).toEqual(
      [...SECTION_IDS].sort(),
    );
  });

  it("keeps object names unique", () => {
    const names = CATALOG.map((object) => object.name.toLowerCase());
    expect(new Set(names).size).toBe(names.length);
  });

  it("names objects with the dbo schema", () => {
    expect(qualifiedName(catalogObject("about"))).toBe("dbo.About");
    expect(qualifiedName(catalogObject("resume"))).toBe("dbo.sp_DownloadCV");
  });
});
