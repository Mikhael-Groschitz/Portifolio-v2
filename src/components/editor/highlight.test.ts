import { describe, expect, it } from "vitest";
import { highlightTsql } from "./highlight";

const identifiers = new Set(["Name", "Role", "Description", "Url", "Career"]);

function colorsOf(code: string) {
  const lines = highlightTsql(code, identifiers);
  const tokens = lines.flat().filter((token) => token.content.trim());
  return (text: string) =>
    tokens.find((token) => token.content === text)?.color;
}

describe("highlightTsql", () => {
  it("keeps keywords blue and column names in the identifier color", () => {
    const colorOf = colorsOf(
      "SELECT Name, Role, Description\nFROM dbo.Career\nORDER BY Role DESC;",
    );
    for (const keyword of ["SELECT", "FROM", "ORDER", "BY", "DESC"]) {
      expect(colorOf(keyword), keyword).toBe("var(--syntax-keyword)");
    }
    for (const identifier of ["Name", "Role", "Description", "Career"]) {
      expect(colorOf(identifier), identifier).toBe("var(--syntax-variable)");
    }
  });

  it("paints punctuation and logical operators gray, like SSMS", () => {
    const colorOf = colorsOf(
      "SELECT Name, Url FROM dbo.Career WHERE Url LIKE 'x%' AND Name IS NOT NULL;",
    );
    for (const operator of [",", ".", ";", "LIKE", "AND"]) {
      expect(colorOf(operator), operator).toBe("var(--syntax-operator)");
    }
  });

  it("leaves comments and strings untouched", () => {
    const colorOf = colorsOf(
      "-- Role, Name and Description\nSELECT 'Role, Name' AS Name;",
    );
    expect(colorOf("-- Role, Name and Description")).toBe(
      "var(--syntax-comment)",
    );
    expect(colorOf("'Role, Name'")).toBe("var(--syntax-string)");
  });
});
