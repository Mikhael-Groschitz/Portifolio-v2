import { describe, expect, it } from "vitest";
import { formatYearMonth } from "./format";

describe("formatYearMonth", () => {
  it("formats in each language without shifting the month", () => {
    expect(formatYearMonth("2023-03", "en")).toBe("Mar 2023");
    expect(formatYearMonth("2024-12", "en")).toBe("Dec 2024");
    expect(formatYearMonth("2023-03", "pt-BR")).toBe("mar. de 2023");
    expect(formatYearMonth("2024-01", "pt-BR")).toBe("jan. de 2024");
  });
});
