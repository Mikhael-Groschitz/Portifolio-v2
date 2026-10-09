import type { Metadata } from "next";
import { HOME_SECTION } from "@/components/shell/section-routes";
import { getTexts } from "@/content";
import {
  DEFAULT_LOCALE,
  LOCALES,
  type Locale,
  type Localized,
  byLocale,
} from "@/content/locales";
import { SECTION_IDS, type SectionId, type Texts } from "@/content/types";

export const SITE_URL = "https://mgroschitz.dev";

export type SitePage = SectionId | "query" | "simple";

export const SITE_PAGES: readonly SitePage[] = [
  ...SECTION_IDS,
  "query",
  "simple",
];

export const INDEXED_PAGES: readonly SitePage[] = [...SECTION_IDS, "simple"];

const OPEN_GRAPH_LOCALES: Record<Locale, string> = {
  "pt-BR": "pt_BR",
  en: "en_US",
};

function withName(template: string, texts: Texts): string {
  return template.replaceAll("{name}", texts.about.name);
}

function pageLabel(
  page: Exclude<SitePage, typeof HOME_SECTION>,
  texts: Texts,
): string {
  if (page === "query") {
    return texts.shell.query.editorLabel;
  }
  if (page === "simple") {
    return texts.simpleVersion.title;
  }
  return texts.simpleVersion.sections[page];
}

export function pageTitle(page: SitePage, texts: Texts): string {
  const { name, role } = texts.about;
  if (page === HOME_SECTION) {
    return `${name} | ${role}`;
  }
  return `${pageLabel(page, texts)} | ${name}`;
}

export function pageDescription(page: SitePage, texts: Texts): string {
  const { seo } = texts;
  if (page === HOME_SECTION || page === "query") {
    return withName(seo.description, texts);
  }
  if (page === "simple") {
    return withName(seo.simple, texts);
  }
  return withName(seo.sections[page], texts);
}

export function imageAlt(texts: Texts): string {
  return withName(texts.seo.imageAlt, texts);
}

function routePath(page: SitePage): string {
  return `/${page}`;
}

export function canonicalPath(page: SitePage): string {
  return page === HOME_SECTION ? "/" : routePath(page);
}

export function pageMetadata(page: SitePage): Metadata {
  const texts = getTexts(DEFAULT_LOCALE);
  return {
    title: pageTitle(page, texts),
    description: pageDescription(page, texts),
    alternates: { canonical: canonicalPath(page) },
  };
}

export function siteMetadata(): Metadata {
  const texts = getTexts(DEFAULT_LOCALE);
  return {
    metadataBase: new URL(SITE_URL),
    title: pageTitle(HOME_SECTION, texts),
    description: pageDescription(HOME_SECTION, texts),
    authors: [{ name: texts.about.name, url: SITE_URL }],
    openGraph: {
      type: "website",
      siteName: texts.about.name,
      locale: OPEN_GRAPH_LOCALES[DEFAULT_LOCALE],
      alternateLocale: LOCALES.filter(
        (locale) => locale !== DEFAULT_LOCALE,
      ).map((locale) => OPEN_GRAPH_LOCALES[locale]),
    },
    twitter: { card: "summary_large_image" },
  };
}

export function pageTitlesByPath(): Record<string, Localized> {
  const titleOf = (page: SitePage) =>
    byLocale((locale) => pageTitle(page, getTexts(locale)));
  return Object.fromEntries([
    ["/", titleOf(HOME_SECTION)],
    ...SITE_PAGES.map((page) => [routePath(page), titleOf(page)]),
  ]);
}
