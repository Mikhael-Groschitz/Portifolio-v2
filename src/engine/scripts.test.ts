import { describe, expect, it } from "vitest";
import { catalogObject } from "./catalog";
import { sectionScript } from "./scripts";

describe("sectionScript", () => {
  it("starts with the friendly comments and the database", () => {
    expect(
      sectionScript(catalogObject("about"), ["Hi!", "Click a table."]),
    ).toBe(
      [
        "-- Hi!",
        "-- Click a table.",
        "USE Portfolio;",
        "GO",
        "",
        "SELECT Name, Role, Summary",
        "FROM dbo.About;",
      ].join("\n"),
    );
  });

  it("keeps the curated tech stack order instead of sorting by category", () => {
    expect(sectionScript(catalogObject("tech-stack"), [])).toContain(
      "FROM dbo.TechStack\nORDER BY SortOrder;",
    );
  });

  it("lists the career from the newest job", () => {
    expect(sectionScript(catalogObject("career"), [])).toContain(
      "ORDER BY StartDate DESC;",
    );
  });

  it("runs the resume procedure instead of selecting", () => {
    expect(sectionScript(catalogObject("resume"), [])).toMatch(
      /GO\n\nEXEC dbo\.sp_DownloadCV;$/,
    );
  });
});
