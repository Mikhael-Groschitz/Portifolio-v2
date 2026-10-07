import { describe, expect, it } from "vitest";
import { getTable, getTexts } from ".";
import { DEFAULT_LOCALE, LOCALES, type Locale } from "./locales";
import { isPlaceholder } from "./placeholder";
import { SECTION_IDS } from "./types";

const YEAR_MONTH = /^\d{4}-(0[1-9]|1[0-2])$/;
const WEB_URL = /^https?:\/\/\S+$/;
const CONTACT_URL = /^(https?:\/\/|mailto:|tel:)\S+$/;
const LOCAL_PDF = /^\/\S+\.pdf$/;
const PROJECT_IMAGE = /^\/projects\/[\w.-]+\.(svg|png|jpe?g|webp)$/;

const otherLocales = LOCALES.filter((locale) => locale !== DEFAULT_LOCALE);

function shapeOf(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(shapeOf);
  }
  if (typeof value === "object" && value !== null) {
    return Object.fromEntries(
      Object.entries(value).map(([key, entry]) => [key, shapeOf(entry)]),
    );
  }
  return value === null ? null : typeof value;
}

function collectStrings(value: unknown): string[] {
  if (typeof value === "string") {
    return [value];
  }
  if (typeof value === "object" && value !== null) {
    return Object.values(value).flatMap(collectStrings);
  }
  return [];
}

function sharedFacts(locale: Locale) {
  const texts = getTexts(locale);
  return {
    name: texts.about.name,
    stackGrouping: texts.techStack.map(
      (row, index, rows) =>
        index > 0 && row.category === rows[index - 1].category,
    ),
    dates: texts.career.map(({ startDate, endDate }) => ({
      startDate,
      endDate,
    })),
    projects: texts.projects.map(({ stack, repoUrl, demoUrl, image }) => ({
      stack,
      repoUrl,
      demoUrl,
      image,
    })),
    contact: texts.contact.channels.map(({ value, url }) => ({ value, url })),
  };
}

function matchesOrPlaceholder(value: string, pattern: RegExp): boolean {
  return isPlaceholder(value) || pattern.test(value);
}

describe("texts", () => {
  it("has the same structure in every language", () => {
    for (const locale of otherLocales) {
      expect(shapeOf(getTexts(locale))).toEqual(
        shapeOf(getTexts(DEFAULT_LOCALE)),
      );
    }
  });

  it("shares names, dates, links and stack grouping across languages", () => {
    for (const locale of otherLocales) {
      expect(sharedFacts(locale)).toEqual(sharedFacts(DEFAULT_LOCALE));
    }
  });

  it("fills every text", () => {
    for (const locale of LOCALES) {
      for (const text of collectStrings(getTexts(locale))) {
        expect(text.trim(), locale).not.toBe("");
      }
    }
  });

  it("uses year-month dates that start before they end", () => {
    for (const job of getTexts().career) {
      expect(matchesOrPlaceholder(job.startDate, YEAR_MONTH), job.company).toBe(
        true,
      );
      if (job.endDate === null) {
        continue;
      }
      expect(matchesOrPlaceholder(job.endDate, YEAR_MONTH), job.company).toBe(
        true,
      );
      if (!isPlaceholder(job.startDate) && !isPlaceholder(job.endDate)) {
        expect(job.startDate <= job.endDate, job.company).toBe(true);
      }
    }
  });

  it("uses valid links and image paths", () => {
    for (const locale of LOCALES) {
      const texts = getTexts(locale);
      for (const project of texts.projects) {
        for (const url of [project.repoUrl, project.demoUrl]) {
          if (url !== null) {
            expect(matchesOrPlaceholder(url, WEB_URL), project.name).toBe(true);
          }
        }
        if (project.image !== null) {
          expect(project.image).toMatch(PROJECT_IMAGE);
        }
      }
      for (const item of texts.contact.channels) {
        expect(matchesOrPlaceholder(item.url, CONTACT_URL), item.value).toBe(
          true,
        );
      }
      expect(matchesOrPlaceholder(texts.resume.url, LOCAL_PDF), locale).toBe(
        true,
      );
    }
  });
});

describe("getTable", () => {
  it.each(SECTION_IDS)("returns %s rows in every language", (section) => {
    for (const locale of LOCALES) {
      expect(getTable(section, locale).length).toBeGreaterThan(0);
    }
  });

  it("lists the career from the newest job to the oldest", () => {
    for (const locale of LOCALES) {
      const dates = getTable("career", locale)
        .map((job) => job.startDate)
        .filter((date) => !isPlaceholder(date));
      expect(dates).toEqual([...dates].sort().reverse());
    }
  });

  it("keeps each tech stack category together", () => {
    for (const locale of LOCALES) {
      const categories = getTable("tech-stack", locale).map(
        (row) => row.category,
      );
      const groups = categories.filter(
        (category, index) => category !== categories[index - 1],
      );
      expect(groups).toEqual([...new Set(categories)]);
    }
  });

  it("keeps project names and contact channels unique", () => {
    for (const locale of LOCALES) {
      const names = getTable("projects", locale).map((project) => project.name);
      expect(new Set(names).size).toBe(names.length);
      const channels = getTable("contact", locale).map((item) => item.channel);
      expect(new Set(channels).size).toBe(channels.length);
    }
  });
});
