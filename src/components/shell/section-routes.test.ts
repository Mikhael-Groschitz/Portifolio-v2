import { describe, expect, it } from "vitest";
import { SECTION_IDS } from "@/content/types";
import {
  HOME_SECTION,
  QUERY_DOCUMENT,
  documentFromSegment,
  documentPath,
  isQueryDocument,
} from "./section-routes";

describe("document routes", () => {
  it("gives every section its own address", () => {
    expect(SECTION_IDS.map(documentPath)).toEqual([
      "/about",
      "/tech-stack",
      "/career",
      "/projects",
      "/beyond-the-terminal",
      "/contact",
      "/resume",
    ]);
  });

  it("gives the new query its own address", () => {
    expect(documentPath(QUERY_DOCUMENT)).toBe("/query");
    expect(documentFromSegment("query")).toBe(QUERY_DOCUMENT);
    expect(isQueryDocument(QUERY_DOCUMENT)).toBe(true);
    expect(isQueryDocument("about")).toBe(false);
  });

  it("reads the document back from the address", () => {
    for (const section of SECTION_IDS) {
      expect(documentFromSegment(documentPath(section).slice(1))).toBe(section);
    }
  });

  it("opens About on the home page and on unknown addresses", () => {
    expect(documentFromSegment(null)).toBe(HOME_SECTION);
    expect(documentFromSegment("palette")).toBe(HOME_SECTION);
    expect(HOME_SECTION).toBe("about");
  });
});
