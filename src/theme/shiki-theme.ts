import type { ThemeRegistration } from "shiki";

export const ssmsDarkTheme: ThemeRegistration = {
  name: "ssms-dark",
  type: "dark",
  colors: {
    "editor.background": "var(--bg-editor)",
    "editor.foreground": "var(--syntax-variable)",
  },
  tokenColors: [
    {
      scope: ["comment", "punctuation.definition.comment"],
      settings: { foreground: "var(--syntax-comment)" },
    },
    {
      scope: ["string", "punctuation.definition.string"],
      settings: { foreground: "var(--syntax-string)" },
    },
    {
      scope: ["constant.numeric"],
      settings: { foreground: "var(--syntax-number)" },
    },
    {
      scope: ["keyword", "storage.modifier"],
      settings: { foreground: "var(--syntax-keyword)" },
    },
    {
      scope: ["storage.type"],
      settings: { foreground: "var(--syntax-type)" },
    },
    {
      scope: ["support.function", "entity.name.function"],
      settings: { foreground: "var(--syntax-function)" },
    },
    {
      scope: ["keyword.operator", "keyword.other.DDL.create.II"],
      settings: { foreground: "var(--syntax-operator)" },
    },
    {
      scope: ["text.variable", "variable", "constant.other"],
      settings: { foreground: "var(--syntax-variable)" },
    },
  ],
};
