import { describe, expect, it } from "vitest";
import {
  formatCompletionTime,
  formatCount,
  formatElapsed,
  formatYearMonth,
} from "./format";

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

describe("formatCompletionTime", () => {
  const moment = new Date(Date.UTC(2026, 9, 6, 13, 23, 38, 830));

  it("writes the local time with seven fraction digits, like SSMS", () => {
    expect(formatCompletionTime(moment, -180)).toBe(
      "2026-10-06T10:23:38.8300000-03:00",
    );
  });

  it("handles positive and partial-hour offsets", () => {
    expect(formatCompletionTime(moment, 330)).toBe(
      "2026-10-06T18:53:38.8300000+05:30",
    );
    expect(formatCompletionTime(moment, 0)).toBe(
      "2026-10-06T13:23:38.8300000+00:00",
    );
  });
});

describe("formatElapsed", () => {
  it("shows hours, minutes and seconds", () => {
    expect(formatElapsed(120)).toBe("00:00:00");
    expect(formatElapsed(61_500)).toBe("00:01:01");
    expect(formatElapsed(3_723_000)).toBe("01:02:03");
  });
});
