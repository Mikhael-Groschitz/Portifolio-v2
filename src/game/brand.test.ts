import { readFileSync, readdirSync } from "node:fs";
import { join, relative, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const ROOT = fileURLToPath(new URL("../..", import.meta.url));
const SOURCE = join(ROOT, "src");
const GUARD = "src/game/brand.test.ts";

const SERIES_TERMS = [
  "castlevania",
  "alucard",
  "belmont",
  "dracula",
  "symphony of the night",
];

const TRIGGER_TERM = "konami";

const TRIGGER_FILES = [
  "src/components/easter-eggs/easter-egg-context.tsx",
  "src/components/easter-eggs/konami.test.ts",
  "src/components/easter-eggs/konami.ts",
  "src/engine/easter-eggs.test.ts",
  "src/engine/easter-eggs.ts",
];

const files = readdirSync(SOURCE, { recursive: true, withFileTypes: true })
  .filter((entry) => entry.isFile())
  .map((entry) =>
    relative(ROOT, join(entry.parentPath, entry.name)).split(sep).join("/"),
  )
  .filter((path) => path !== GUARD)
  .map((path) => ({
    path,
    text: `${path}\n${readFileSync(join(ROOT, path), "utf8")}`.toLowerCase(),
  }));

describe("brand guard", () => {
  it("scans the whole source tree", () => {
    expect(files.length).toBeGreaterThan(100);
    expect(files.some(({ path }) => path.startsWith("src/game/"))).toBe(true);
  });

  it("keeps the names of the homaged series out of names, code and texts", () => {
    const offenders = files.filter(({ text }) =>
      SERIES_TERMS.some((term) => text.includes(term)),
    );
    expect(offenders.map(({ path }) => path)).toEqual([]);
  });

  it("allows the trigger word only in the trigger files", () => {
    const offenders = files.filter(
      ({ path, text }) =>
        text.includes(TRIGGER_TERM) && !TRIGGER_FILES.includes(path),
    );
    expect(offenders.map(({ path }) => path)).toEqual([]);
  });

  it("lists trigger files that still exist and still hold the trigger", () => {
    for (const trigger of TRIGGER_FILES) {
      const file = files.find(({ path }) => path === trigger);
      expect(file?.text, trigger).toContain(TRIGGER_TERM);
    }
  });
});
