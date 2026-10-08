import { readFileSync, readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { COMPACT_MEDIA_QUERY } from "./breakpoints";

const sourceDir = fileURLToPath(new URL("../..", import.meta.url));

const stylesheets = readdirSync(sourceDir, {
  recursive: true,
  encoding: "utf8",
})
  .filter((file) => file.endsWith(".css"))
  .map((file) => ({ file, css: readFileSync(`${sourceDir}/${file}`, "utf8") }));

describe("compact breakpoint", () => {
  it("is the only width media query in the stylesheets", () => {
    const widthQueries = stylesheets.flatMap(({ file, css }) =>
      [...css.matchAll(/@media\s+([^{]*width[^{]*?)\s*\{/g)].map(
        ([, query]) => ({ file, query }),
      ),
    );
    expect(widthQueries.length).toBeGreaterThan(0);
    for (const { file, query } of widthQueries) {
      expect(query, file).toBe(COMPACT_MEDIA_QUERY);
    }
  });
});
