import { describe, expect, it } from "vitest";
import { normalize } from "./normalize";

describe("normalize", () => {
  it("lowercases and collapses spaces", () => {
    expect(normalize("  SELECT   Name,\n\tRole  FROM dbo.About ")).toBe(
      "select name, role from dbo.about",
    );
  });

  it("drops semicolons, GO and line comments", () => {
    expect(
      normalize(
        "-- Oi!\nUSE Portfolio;\nGO\n\nSELECT * FROM dbo.About; -- fim",
      ),
    ).toBe("use portfolio select * from dbo.about");
  });

  it("keeps words that only contain go", () => {
    expect(normalize("SELECT Category FROM dbo.TechStack")).toBe(
      "select category from dbo.techstack",
    );
  });
});
