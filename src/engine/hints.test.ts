import { describe, expect, it } from "vitest";
import { editDistance, hintFor } from "./hints";

describe("hints", () => {
  it("measures how far two words are", () => {
    expect(editDistance("career", "career")).toBe(0);
    expect(editDistance("carrer", "career")).toBe(1);
    expect(editDistance("kitten", "sitting")).toBe(3);
    expect(editDistance("techstak", "techstack")).toBe(1);
    expect(editDistance("", "abc")).toBe(3);
  });

  it.each([
    ["select name from dbo.career", "SELECT * FROM dbo.Career"],
    ["select * from carrer", "SELECT * FROM dbo.Career"],
    ["show me the proj", "SELECT * FROM dbo.Projects"],
    ["exec sp_downloadcvv", "EXEC dbo.sp_DownloadCV"],
    ["SELECT * FROM TechStak", "SELECT * FROM dbo.TechStack"],
  ])("suggests a similar object for %j", (statement, command) => {
    expect(hintFor(statement)).toEqual({ kind: "similar", command });
  });

  it.each(["drop table users", "olá", "", "< img src = x >"])(
    "falls back to HELP for %j",
    (statement) => {
      expect(hintFor(statement)).toEqual({
        kind: "help",
        command: "SELECT * FROM dbo.About",
      });
    },
  );
});
