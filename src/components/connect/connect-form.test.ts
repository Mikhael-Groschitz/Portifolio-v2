import { describe, expect, it } from "vitest";
import {
  INITIAL_FORM_VALUES,
  connectionRecordOf,
  defaultParameters,
  languageFromParameters,
} from "./connect-form";

describe("additional connection parameters", () => {
  it("starts with the current language", () => {
    expect(defaultParameters("pt-BR")).toBe("Language=pt-BR");
    expect(languageFromParameters(defaultParameters("en"))).toBe("en");
  });

  it.each([
    ["Language=pt-BR", "pt-BR"],
    ["language = en", "en"],
    ["LANGUAGE=EN-us", "en"],
    ["Language=pt", "pt-BR"],
    ["App=Portfolio;Language=en", "en"],
    ["App=Portfolio\nLanguage=en\n", "en"],
    ["Language=pt-BR;Language=en", "pt-BR"],
  ])("reads %j as %s", (parameters, expected) => {
    expect(languageFromParameters(parameters)).toBe(expected);
  });

  it.each([
    "",
    "Language=",
    "Language=fr",
    "Language",
    "Lang=en",
    "<script>Language=en</script>",
  ])("keeps the current language for %j", (parameters) => {
    expect(languageFromParameters(parameters)).toBeNull();
  });
});

describe("connection record", () => {
  it("keeps the yellow bar when no custom color is chosen", () => {
    expect(connectionRecordOf(INITIAL_FORM_VALUES)).toEqual({
      profile: "visitor",
      colors: null,
    });
    expect(
      connectionRecordOf({
        ...INITIAL_FORM_VALUES,
        useCustomColor: false,
        color: "#1f3a5f",
      }),
    ).toEqual({ profile: "visitor", colors: null });
  });

  it("stores the custom color with readable text", () => {
    expect(
      connectionRecordOf({
        ...INITIAL_FORM_VALUES,
        profile: "dev",
        useCustomColor: true,
        color: "#1F3A5F",
      }),
    ).toEqual({
      profile: "dev",
      colors: { background: "#1f3a5f", ink: "light" },
    });
    expect(
      connectionRecordOf({
        ...INITIAL_FORM_VALUES,
        useCustomColor: true,
        color: "#9cdcfe",
      }).colors,
    ).toEqual({ background: "#9cdcfe", ink: "dark" });
  });

  it("ignores anything that is not a hex color", () => {
    expect(
      connectionRecordOf({
        ...INITIAL_FORM_VALUES,
        useCustomColor: true,
        color: "red",
      }).colors,
    ).toBeNull();
  });
});
