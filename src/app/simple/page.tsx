import type { Metadata } from "next";
import { SimpleVersion } from "@/components/simple/simple-version";
import { getTexts } from "@/content";
import { DEFAULT_LOCALE } from "@/content/locales";

const { about, simpleVersion } = getTexts(DEFAULT_LOCALE);

export const metadata: Metadata = {
  title: `${simpleVersion.title} | ${about.name}`,
  description: simpleVersion.intro,
};

export default function SimplePage() {
  return <SimpleVersion />;
}
