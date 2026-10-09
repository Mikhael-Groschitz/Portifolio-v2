import type { Metadata } from "next";
import { QueryEditor } from "@/components/editor/query-editor";
import { getTexts, localize } from "@/content";
import { DEFAULT_LOCALE } from "@/content/locales";

const { about, shell } = getTexts(DEFAULT_LOCALE);

export const metadata: Metadata = {
  title: `${shell.query.editorLabel} | ${about.name}`,
  robots: { index: false },
};

export default function QueryPage() {
  return <QueryEditor text={localize((texts) => texts.shell.query)} />;
}
