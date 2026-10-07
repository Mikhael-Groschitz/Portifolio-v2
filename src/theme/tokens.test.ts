import { readFileSync } from "node:fs";
import { codeToTokens } from "shiki";
import { describe, expect, it } from "vitest";
import { contrastRatio, isHexColor } from "./contrast";
import { ssmsDarkTheme } from "./shiki-theme";
import { CONTRAST_PAIRS, TOKEN_NAMES, parseTokens } from "./tokens";

const css = readFileSync(new URL("./tokens.css", import.meta.url), "utf8");
const tokens = parseTokens(css);
const colorOf = (name: string) => tokens.get(name) ?? "";

describe("tokens.css", () => {
  it("defines every expected token as a hex color", () => {
    for (const name of TOKEN_NAMES) {
      expect(isHexColor(colorOf(name)), name).toBe(true);
    }
  });

  it.each(CONTRAST_PAIRS)("$fg on $bg reaches $min:1", ({ fg, bg, min }) => {
    expect(contrastRatio(colorOf(fg), colorOf(bg))).toBeGreaterThanOrEqual(min);
  });

  it("declares the system font stacks", () => {
    expect(css).toMatch(/--font-code:\s*Consolas/);
    expect(css).toMatch(/--font-ui:\s*"Segoe UI"/);
  });
});

describe("shiki theme", () => {
  it("only references tokens that exist", () => {
    const references = JSON.stringify(ssmsDarkTheme).matchAll(
      /var\(--([a-z0-9-]+)\)/g,
    );
    for (const [, name] of references) {
      expect(tokens.has(name), name).toBe(true);
    }
  });

  it("colors T-SQL with the token variables", async () => {
    const { tokens: lines } = await codeToTokens("SELECT 1, 'x' -- note", {
      lang: "sql",
      theme: ssmsDarkTheme,
    });
    const colorOfText = (text: string) =>
      lines.flat().find((token) => token.content.trim() === text)?.color;

    expect(colorOfText("SELECT")).toBe("var(--syntax-keyword)");
    expect(colorOfText("1")).toBe("var(--syntax-number)");
    expect(colorOfText("'x'")).toBe("var(--syntax-string)");
  });
});
