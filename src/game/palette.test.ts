import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { type Color, COLORS, PALETTE, TRANSPARENT } from "./palette";

const TOKENS = readFileSync(
  fileURLToPath(new URL("../theme/tokens.css", import.meta.url)),
  "utf8",
);

const SYNTAX_TOKENS: Partial<Record<Color, string>> = {
  keyword: "--syntax-keyword",
  string: "--syntax-string",
  comment: "--syntax-comment",
  function: "--syntax-function",
};

function token(name: string): string | undefined {
  return TOKENS.match(new RegExp(`${name}:\\s*(#[0-9a-f]{6})`, "i"))?.[1];
}

describe("game palette", () => {
  it("keeps a small set of solid colors", () => {
    const colors = Object.values(COLORS);
    expect(colors.length).toBeLessThanOrEqual(32);
    for (const color of colors) {
      expect(color).toMatch(/^#[0-9a-f]{6}$/);
    }
    expect(new Set(colors).size).toBe(colors.length);
  });

  it("gives every color a one-character key for the sprites", () => {
    expect(Object.keys(PALETTE)).not.toContain(TRANSPARENT);
    for (const [key, color] of Object.entries(PALETTE)) {
      expect(key).toHaveLength(1);
      expect(COLORS).toHaveProperty(color);
    }
    expect(new Set(Object.values(PALETTE)).size).toBe(
      Object.keys(COLORS).length,
    );
  });

  it("shares the syntax colors with the site theme", () => {
    for (const [color, name] of Object.entries(SYNTAX_TOKENS)) {
      expect(COLORS[color as Color]).toBe(token(name)?.toLowerCase());
    }
  });
});
