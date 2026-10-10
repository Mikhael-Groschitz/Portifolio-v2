import { describe, expect, it } from "vitest";
import { getTexts } from "@/content";
import { formatCount } from "@/content/format";
import { LOCALES } from "@/content/locales";
import { GAME_TEXTS } from "./texts";

function shapeOf(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(shapeOf);
  }
  if (typeof value === "object" && value !== null) {
    return Object.fromEntries(
      Object.entries(value).map(([key, entry]) => [key, shapeOf(entry)]),
    );
  }
  return typeof value;
}

function strings(value: unknown): string[] {
  if (typeof value === "string") {
    return [value];
  }
  if (typeof value === "object" && value !== null) {
    return Object.values(value).flatMap(strings);
  }
  return [];
}

describe("game texts", () => {
  it("has the same structure in both languages", () => {
    expect(shapeOf(GAME_TEXTS.en)).toEqual(shapeOf(GAME_TEXTS["pt-BR"]));
  });

  it("fills every text", () => {
    for (const locale of LOCALES) {
      for (const text of strings(GAME_TEXTS[locale])) {
        expect(text.trim()).not.toBe("");
      }
    }
  });

  it("speaks the same SSMS language as the rest of the site", () => {
    for (const locale of LOCALES) {
      const { results, connection, game } = getTexts(locale).shell;
      const { crash, exit, victory } = GAME_TEXTS[locale];
      expect(crash.header).toBe(
        results.errorHeader
          .replace("{number}", "701")
          .replace("{level}", "17")
          .replace("{state}", "1")
          .replace("{line}", "1"),
      );
      expect(crash.completionTime).toBe(results.completionTime);
      expect(crash.status).toBe(connection.failed);
      expect(exit).toBe(game.exit);
      expect(victory.rows).toBe(formatCount(results.rowsAffected, 1));
      expect(victory.completionTime).toBe(results.completionTime);
      expect(victory.status).toBe(connection.succeeded);
    }
  });

  it("tells the run time when announcing the victory", () => {
    for (const locale of LOCALES) {
      expect(GAME_TEXTS[locale].victory.announcement).toContain("{time}");
    }
  });
});
