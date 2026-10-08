import { describe, expect, it } from "vitest";
import { getTable, getTexts } from "@/content";
import { LOCALES } from "@/content/locales";
import { CATALOG, catalogObject } from "./catalog";
import { type ExecutionOutcome, execute } from "./execute";
import { sectionScript } from "./scripts";

function rowsOf(outcome: ExecutionOutcome) {
  if (outcome.kind !== "rows") {
    throw new Error(`expected rows, got ${outcome.error.message}`);
  }
  return outcome.resultSet;
}

describe("execute", () => {
  it("runs every section script, comments included, in each language", () => {
    for (const object of CATALOG) {
      for (const locale of LOCALES) {
        const script = sectionScript(
          object,
          getTexts(locale).shell.scripts[object.section],
        );
        const resultSet = rowsOf(execute(script, { locale }));
        expect(resultSet.source).toBe(`dbo.${object.name}`);
        expect(resultSet.columns.map((column) => column.name)).toEqual(
          object.columns.map((column) => column.name),
        );
        expect(resultSet.rows).toHaveLength(
          getTable(object.section, locale).length,
        );
      }
    }
  });

  it("answers in the language of the context", () => {
    const script = sectionScript(catalogObject("about"), []);
    const summaryOf = (locale: (typeof LOCALES)[number]) =>
      rowsOf(execute(script, { locale })).rows[0][2];
    expect(summaryOf("pt-BR")).toEqual({
      kind: "text",
      text: getTexts("pt-BR").about.summary,
    });
    expect(summaryOf("en")).toEqual({
      kind: "text",
      text: getTexts("en").about.summary,
    });
  });

  it("accepts SELECT * and EXEC shortcuts, whatever the case and spacing", () => {
    for (const command of [
      "select * from dbo.career",
      "  SELECT *   FROM   Career ;",
      "EXEC sp_DownloadCV",
      "exec DBO.SP_DOWNLOADCV;;",
    ]) {
      expect(execute(command, { locale: "en" }).kind, command).toBe("rows");
    }
  });

  it("turns lists, empty values, links and the resume into cells", () => {
    const career = rowsOf(
      execute("SELECT * FROM dbo.Career", { locale: "en" }),
    );
    expect(career.rows[0][3]).toEqual({ kind: "null" });

    const projects = rowsOf(
      execute("SELECT * FROM dbo.Projects", { locale: "en" }),
    );
    const [firstProject] = getTable("projects", "en");
    expect(projects.rows[0][3]).toEqual({
      kind: "text",
      text: firstProject.stack.join(", "),
    });
    expect(projects.rows[0][4]).toMatchObject({
      kind: "link",
      href: firstProject.repoUrl,
    });

    const resume = rowsOf(
      execute("EXEC dbo.sp_DownloadCV", { locale: "pt-BR" }),
    );
    const [file] = getTable("resume", "pt-BR");
    expect(resume.rows[0][1]).toEqual({
      kind: "link",
      text: file.url,
      href: file.url,
      download: file.fileName,
    });
  });

  it("reports unknown commands as SQL errors", () => {
    const outcome = execute("DROP TABLE dbo.About;", { locale: "en" });
    expect(outcome).toEqual({
      kind: "error",
      database: "Portfolio",
      error: {
        number: 102,
        level: 15,
        state: 1,
        line: 1,
        message: "Incorrect syntax near 'drop'.",
      },
    });
  });
});
