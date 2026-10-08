import { describe, expect, it } from "vitest";
import { formatCount, formatYearMonth } from "./format";

describe("formatYearMonth", () => {
  it("formats in each language without shifting the month", () => {
    expect(formatYearMonth("2023-03", "en")).toBe("Mar 2023");
    expect(formatYearMonth("2024-12", "en")).toBe("Dec 2024");
    expect(formatYearMonth("2023-03", "pt-BR")).toBe("mar. de 2023");
    expect(formatYearMonth("2024-01", "pt-BR")).toBe("jan. de 2024");
  });
});

describe("formatCount", () => {
  const rows = {
    one: "({count} row affected)",
    other: "({count} rows affected)",
  };

  it("uses the singular only for exactly one", () => {
    expect(formatCount(rows, 1)).toBe("(1 row affected)");
    expect(formatCount(rows, 0)).toBe("(0 rows affected)");
    expect(formatCount(rows, 12)).toBe("(12 rows affected)");
  });
});
