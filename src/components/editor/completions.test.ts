import { describe, expect, it } from "vitest";
import { completionAt, isWordCharacter } from "./completions";

const labels = (text: string, caret = text.length, explicit = false) =>
  completionAt(text, caret, explicit)?.items.map((item) => item.label) ?? null;

describe("completionAt", () => {
  it("suggests keywords, tables and procedures while typing", () => {
    expect(labels("sel")).toEqual(["SELECT"]);
    expect(labels("he")).toEqual(["HELP"]);
    expect(labels("help")).toEqual(["HELP", "sp_help"]);
  });

  it("lists the tables right after FROM", () => {
    expect(labels("SELECT * FROM ")).toEqual([
      "dbo.About",
      "dbo.TechStack",
      "dbo.Career",
      "dbo.Projects",
      "dbo.BeyondTheTerminal",
      "dbo.Contact",
    ]);
  });

  it("matches tables by their short name too", () => {
    expect(labels("SELECT * FROM car")).toEqual(["dbo.Career"]);
    expect(labels("select * from DBO.Pro")).toEqual(["dbo.Projects"]);
  });

  it("lists procedures after EXEC and the database after USE", () => {
    expect(labels("EXEC ")).toEqual(["dbo.sp_DownloadCV", "sp_help"]);
    expect(labels("use ")).toEqual(["Portfolio"]);
  });

  it("also finds longer pieces in the middle of a name", () => {
    expect(labels("EXEC help")).toEqual(["sp_help"]);
    expect(labels("download")).toEqual(["dbo.sp_DownloadCV"]);
    expect(labels("ca")).toEqual(["dbo.Career"]);
  });

  it("keeps the secrets out of the list", () => {
    expect(labels("USE Portfolio_")).toBeNull();
    expect(labels("EXEC sp_Re")).toBeNull();
    expect(labels("", 0, true)).not.toContain("Portfolio_v1");
  });

  it("stays quiet until there is something to complete", () => {
    expect(labels("")).toBeNull();
    expect(labels("SELECT * ")).toBeNull();
    expect(labels("xyz")).toBeNull();
  });

  it("opens with everything when asked explicitly", () => {
    expect(labels("", 0, true)).toHaveLength(13);
  });

  it("replaces only the word under the caret", () => {
    const text = "SELECT * FROM dbo.Ca WHERE";
    expect(completionAt(text, 20)).toMatchObject({ from: 14, to: 20 });
  });

  it("knows which characters belong to a word", () => {
    expect(["a", "Z", "9", "_", ".", "ç"].every(isWordCharacter)).toBe(true);
    expect([" ", ";", ",", "(", "*", "\n"].some(isWordCharacter)).toBe(false);
  });
});
