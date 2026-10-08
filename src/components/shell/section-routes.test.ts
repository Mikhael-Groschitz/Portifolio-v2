import { describe, expect, it } from "vitest";
import { SECTION_IDS } from "@/content/types";
import {
  HOME_SECTION,
  sectionFromSegment,
  sectionPath,
} from "./section-routes";

describe("section routes", () => {
  it("gives every section its own address", () => {
    expect(SECTION_IDS.map(sectionPath)).toEqual([
      "/about",
      "/tech-stack",
      "/career",
      "/projects",
      "/beyond-the-terminal",
      "/contact",
      "/resume",
    ]);
  });

  it("reads the section back from the address", () => {
    for (const section of SECTION_IDS) {
      expect(sectionFromSegment(sectionPath(section).slice(1))).toBe(section);
    }
  });

  it("opens About on the home page", () => {
    expect(sectionFromSegment(null)).toBe(HOME_SECTION);
    expect(HOME_SECTION).toBe("about");
  });
});
