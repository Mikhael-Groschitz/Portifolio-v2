import { describe, expect, it } from "vitest";
import { getTexts } from "@/content";
import { DEFAULT_LOCALE, LOCALES } from "@/content/locales";
import { execute } from "@/engine/execute";

const examples = getTexts(DEFAULT_LOCALE).shell.cheatsheet.examples;
const commands = examples.map((example) => example.command);

describe("cheat sheet examples", () => {
  it("use the same commands in every language", () => {
    for (const locale of LOCALES) {
      expect(
        getTexts(locale).shell.cheatsheet.examples.map(
          (example) => example.command,
        ),
      ).toEqual(commands);
    }
  });

  it("run as written, except the mistake shown on purpose", () => {
    const [mistake, ...valid] = [...commands].reverse();
    for (const command of valid) {
      expect(execute(command, { locale: "pt-BR" }).kind, command).toBe(
        "results",
      );
    }
    expect(
      execute(mistake, { locale: "pt-BR", random: () => 0 }),
    ).toMatchObject({
      kind: "error",
      hint: { command: "SELECT * FROM dbo.Career", similar: true },
    });
  });
});
