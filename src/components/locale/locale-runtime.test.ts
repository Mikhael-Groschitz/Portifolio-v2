import { runInNewContext } from "node:vm";
import { describe, expect, it } from "vitest";
import { DEFAULT_LOCALE } from "@/content/locales";
import {
  LOCALE_ATTRIBUTE,
  LOCALE_SCRIPT,
  LOCALE_STORAGE_KEY,
  applyLocale,
  detectLocale,
  matchLocale,
  nextLocale,
  readAppliedLocale,
  readStoredLocale,
  resolveInitialLocale,
  storeLocale,
} from "./locale-runtime";

function fakeRoot() {
  const attributes = new Map<string, string>();
  return {
    lang: DEFAULT_LOCALE as string,
    getAttribute: (name: string) => attributes.get(name) ?? null,
    setAttribute: (name: string, value: string) => {
      attributes.set(name, value);
    },
  };
}

function fakeStorage() {
  const values = new Map<string, string>();
  return {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => {
      values.set(key, value);
    },
  };
}

const blockedStorage = {
  getItem: (): string | null => {
    throw new Error("blocked");
  },
  setItem: () => {
    throw new Error("blocked");
  },
};

function runLocaleScript(
  storage: { getItem: () => string | null },
  languages: string[],
) {
  const root = fakeRoot();
  runInNewContext(LOCALE_SCRIPT, {
    document: { documentElement: root },
    localStorage: storage,
    navigator: { languages, language: languages[0] ?? "" },
  });
  return {
    lang: root.lang,
    locale: root.getAttribute(LOCALE_ATTRIBUTE) ?? DEFAULT_LOCALE,
  };
}

const scenarios: [string | null, string[], string][] = [
  [null, ["pt-BR"], "pt-BR"],
  [null, ["pt-PT"], "pt-BR"],
  [null, ["en-US"], "en"],
  [null, ["es-ES", "pt-BR"], "pt-BR"],
  [null, ["fr-FR"], "en"],
  [null, [], "en"],
  ["en", ["pt-BR"], "en"],
  ["pt-BR", ["en-GB"], "pt-BR"],
  ["<b>en</b>", ["pt-BR"], "pt-BR"],
];

describe("initial language", () => {
  it.each(scenarios)(
    "stored %s with system languages %j resolves to %s",
    (stored, languages, expected) => {
      expect(resolveInitialLocale(stored, languages)).toBe(expected);
    },
  );

  it.each(scenarios)(
    "the head script agrees for stored %s and %j",
    (stored, languages, expected) => {
      const result = runLocaleScript({ getItem: () => stored }, languages);
      expect(result).toEqual({ lang: expected, locale: expected });
    },
  );

  it("follows the system language when storage is blocked", () => {
    expect(runLocaleScript(blockedStorage, ["en-US"])).toEqual({
      lang: "en",
      locale: "en",
    });
    expect(runLocaleScript(blockedStorage, ["pt-BR"])).toEqual({
      lang: "pt-BR",
      locale: "pt-BR",
    });
  });

  it("picks the first supported language from the system list", () => {
    expect(detectLocale(["de-DE", "en-US", "pt-BR"])).toBe("en");
    expect(detectLocale(["PT-br"])).toBe("pt-BR");
  });

  it("matches a single language tag or nothing", () => {
    expect(matchLocale(" en-GB ")).toBe("en");
    expect(matchLocale("pt")).toBe("pt-BR");
    expect(matchLocale("fr-FR")).toBeNull();
    expect(matchLocale("")).toBeNull();
  });
});

describe("locale runtime", () => {
  it("applies and reads the locale on the root element", () => {
    const root = fakeRoot();
    expect(readAppliedLocale(root)).toBe("pt-BR");
    applyLocale("en", root);
    expect(root.lang).toBe("en");
    expect(readAppliedLocale(root)).toBe("en");
  });

  it("remembers the choice", () => {
    const storage = fakeStorage();
    expect(readStoredLocale(storage)).toBeNull();
    expect(storeLocale("en", storage)).toBe(true);
    expect(storage.getItem(LOCALE_STORAGE_KEY)).toBe("en");
    expect(readStoredLocale(storage)).toBe("en");
  });

  it("keeps working when storage is blocked", () => {
    expect(storeLocale("en", blockedStorage)).toBe(false);
    expect(readStoredLocale(blockedStorage)).toBeNull();
  });

  it("alternates between the two languages", () => {
    expect(nextLocale("pt-BR")).toBe("en");
    expect(nextLocale("en")).toBe("pt-BR");
  });
});
