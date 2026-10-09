import { describe, expect, it } from "vitest";
import { getTable, getTexts } from "@/content";
import { LOCALES } from "@/content/locales";
import { CATALOG, catalogObject } from "./catalog";
import { ERROR_POOL } from "./errors";
import {
  type ExecutionOutcome,
  MAX_QUERY_LENGTH,
  execute,
  resultSetsOf,
  rowCountOf,
} from "./execute";
import { sectionScript } from "./scripts";

const first = () => 0;

function resultSets(outcome: ExecutionOutcome) {
  if (outcome.kind === "error") {
    throw new Error(`expected results, got ${outcome.error.message}`);
  }
  return resultSetsOf(outcome);
}

function onlyResultSet(outcome: ExecutionOutcome) {
  const sets = resultSets(outcome);
  expect(sets).toHaveLength(1);
  return sets[0];
}

describe("execute", () => {
  it("runs every section script, comments included, in each language", () => {
    for (const object of CATALOG) {
      for (const locale of LOCALES) {
        const script = sectionScript(
          object,
          getTexts(locale).shell.scripts[object.section],
        );
        const outcome = execute(script, { locale });
        expect(outcome).toMatchObject({
          kind: "results",
          results: [{ kind: "done" }, { kind: "rows" }],
        });
        const resultSet = onlyResultSet(outcome);
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
      onlyResultSet(execute(script, { locale })).rows[0][2];
    expect(summaryOf("pt-BR")).toEqual({
      kind: "text",
      text: getTexts("pt-BR").about.summary,
    });
    expect(summaryOf("en")).toEqual({
      kind: "text",
      text: getTexts("en").about.summary,
    });
  });

  it.each([
    "select * from dbo.career",
    "  SELECT *   FROM   Career ;",
    "SELECT * FROM [Portfolio].[dbo].[Career]",
    "select *\nfrom dbo.Career -- comentário\nGO",
    "/* note */ SeLeCt * FrOm Portfolio.dbo.Career;;",
  ])("accepts %j, whatever the case, spacing and noise", (command) => {
    expect(onlyResultSet(execute(command, { locale: "en" })).source).toBe(
      "dbo.Career",
    );
  });

  it.each([
    "EXEC sp_DownloadCV",
    "exec DBO.SP_DOWNLOADCV;;",
    "EXECUTE dbo.sp_DownloadCV",
    "sp_DownloadCV",
  ])("runs the resume procedure with %j", (command) => {
    expect(onlyResultSet(execute(command, { locale: "en" })).source).toBe(
      "dbo.sp_DownloadCV",
    );
  });

  it("turns lists, empty values, links and the resume into cells", () => {
    const career = onlyResultSet(
      execute("SELECT * FROM dbo.Career", { locale: "en" }),
    );
    expect(career.rows[0][3]).toEqual({ kind: "null" });

    const projects = onlyResultSet(
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

    const resume = onlyResultSet(
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

  it("runs every statement of a batch, in order", () => {
    const outcome = execute(
      "USE Portfolio;\nSELECT * FROM dbo.About;\nSELECT * FROM dbo.Contact",
      { locale: "en" },
    );
    expect(resultSets(outcome).map((set) => set.source)).toEqual([
      "dbo.About",
      "dbo.Contact",
    ]);
    expect(rowCountOf(outcome)).toBe(
      getTable("about", "en").length + getTable("contact", "en").length,
    );
  });

  it("completes USE without rows", () => {
    expect(execute("use portfolio", { locale: "pt-BR" })).toEqual({
      kind: "results",
      database: "Portfolio",
      results: [{ kind: "done" }],
    });
  });

  it("treats a blank query as done", () => {
    expect(execute("  -- nada\n", { locale: "en" })).toEqual({
      kind: "results",
      database: "Portfolio",
      results: [],
    });
  });

  it.each(["HELP", "help;", "EXEC sp_help", "sp_help", "exec sys.sp_help"])(
    "lists the objects and the commands with %j",
    (command) => {
      const [objects, commands] = resultSets(
        execute(command, { locale: "pt-BR" }),
      );
      expect(objects.columns.map((column) => column.name)).toEqual([
        "Name",
        "Owner",
        "Object_type",
      ]);
      expect(objects.rows.map((row) => row[0])).toEqual(
        CATALOG.map((object) => ({ kind: "text", text: object.name })),
      );
      expect(commands.rows.map((row) => row[0])).toContainEqual({
        kind: "text",
        text: "SELECT * FROM dbo.Career",
      });
      expect(commands.rows.map((row) => row[0])).toContainEqual({
        kind: "text",
        text: "HELP",
      });
    },
  );

  it("answers unknown commands with an error from the pool", () => {
    const outcome = execute("DROP TABLE dbo.About;", {
      locale: "en",
      random: first,
    });
    expect(outcome).toEqual({
      kind: "error",
      database: "Portfolio",
      error: {
        number: ERROR_POOL[0].code,
        level: 16,
        state: 1,
        line: 1,
        message: ERROR_POOL[0].text.en,
      },
      hint: { command: "SELECT * FROM dbo.About", similar: true },
    });
  });

  it("picks the same error in every language for the same draw", () => {
    const last = () => 0.999;
    const [pt, en] = LOCALES.map((locale) =>
      execute("DROP DATABASE Portfolio", { locale, random: last }),
    );
    const entry = ERROR_POOL.at(-1);
    expect(pt).toMatchObject({
      error: { number: entry?.code, message: entry?.text["pt-BR"] },
    });
    expect(en).toMatchObject({
      error: { number: entry?.code, message: entry?.text.en },
    });
  });

  it("points at the line of the statement that failed", () => {
    const outcome = execute(
      "SELECT * FROM dbo.About\nGO\n\nSELECT * FROM dbo.Carrer",
      { locale: "en", random: first },
    );
    expect(outcome).toMatchObject({
      kind: "error",
      error: { line: 4 },
      hint: { command: "SELECT * FROM dbo.Career", similar: true },
    });
  });

  it("suggests HELP when nothing looks familiar", () => {
    expect(
      execute("<img src=x onerror=alert(1)>", { locale: "en", random: first }),
    ).toMatchObject({
      kind: "error",
      hint: { command: "SELECT * FROM dbo.About", similar: false },
    });
  });

  it("refuses queries longer than the limit", () => {
    const huge = "SELECT * FROM dbo.About;\n".repeat(
      Math.ceil(MAX_QUERY_LENGTH / 20),
    );
    expect(huge.length).toBeGreaterThan(MAX_QUERY_LENGTH);
    expect(execute(huge, { locale: "en", random: first })).toMatchObject({
      kind: "error",
      error: { line: 1 },
    });
  });
});
