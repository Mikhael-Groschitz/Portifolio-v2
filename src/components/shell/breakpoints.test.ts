import { readFileSync, readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { COMPACT_MEDIA_QUERY, WIDE_MEDIA_QUERY } from "./breakpoints";

const sourceDir = fileURLToPath(new URL("../..", import.meta.url));

const stylesheets = readdirSync(sourceDir, {
  recursive: true,
  encoding: "utf8",
})
  .filter((file) => file.endsWith(".css"))
  .map((file) => ({ file, css: readFileSync(`${sourceDir}/${file}`, "utf8") }));

const widthQueries = stylesheets.flatMap(({ file, css }) =>
  [...css.matchAll(/@media\s+([^{]*width[^{]*?)\s*\{/g)].map(([, query]) => ({
    file,
    query,
  })),
);

describe("breakpoints", () => {
  it("only uses the shared width media queries in the stylesheets", () => {
    expect(widthQueries.length).toBeGreaterThan(0);
    for (const { file, query } of widthQueries) {
      expect([COMPACT_MEDIA_QUERY, WIDE_MEDIA_QUERY], file).toContain(query);
    }
  });

  it("uses both breakpoints somewhere", () => {
    const used = new Set(widthQueries.map(({ query }) => query));
    expect(used).toEqual(new Set([COMPACT_MEDIA_QUERY, WIDE_MEDIA_QUERY]));
  });
});
