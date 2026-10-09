import { describe, expect, it } from "vitest";
import { getTexts } from "@/content";
import { LOCALES } from "@/content/locales";
import robots from "./robots";
import {
  INDEXED_PAGES,
  SITE_PAGES,
  SITE_URL,
  canonicalPath,
  imageAlt,
  pageDescription,
  pageMetadata,
  pageTitle,
  pageTitlesByPath,
  siteMetadata,
} from "./site-metadata";
import sitemap from "./sitemap";

describe("page titles", () => {
  it("names the home page after the person and the headline", () => {
    expect(pageTitle("about", getTexts("pt-BR"))).toBe(
      "Mikhael Groschitz Costa | Engenheiro de dados",
    );
    expect(pageTitle("about", getTexts("en"))).toBe(
      "Mikhael Groschitz Costa | Data Engineer",
    );
  });

  it("puts the page name before the person's name", () => {
    expect(pageTitle("career", getTexts("pt-BR"))).toBe(
      "Carreira | Mikhael Groschitz Costa",
    );
    expect(pageTitle("career", getTexts("en"))).toBe(
      "Career | Mikhael Groschitz Costa",
    );
    expect(pageTitle("simple", getTexts("pt-BR"))).toBe(
      "Versão simples | Mikhael Groschitz Costa",
    );
    expect(pageTitle("query", getTexts("en"))).toBe(
      "New query | Mikhael Groschitz Costa",
    );
  });

  it("gives every page its own title in every language", () => {
    for (const locale of LOCALES) {
      const titles = SITE_PAGES.map((page) =>
        pageTitle(page, getTexts(locale)),
      );
      expect(new Set(titles).size).toBe(titles.length);
    }
  });

  it("knows the title of every address in both languages", () => {
    const titles = pageTitlesByPath();
    expect(Object.keys(titles).sort()).toEqual(
      ["/", ...SITE_PAGES.map((page) => `/${page}`)].sort(),
    );
    expect(titles["/"]).toEqual(titles["/about"]);
    expect(titles["/career"]).toEqual({
      "pt-BR": "Carreira | Mikhael Groschitz Costa",
      en: "Career | Mikhael Groschitz Costa",
    });
  });
});

describe("page descriptions", () => {
  it("fills in the name and leaves no placeholder behind", () => {
    for (const locale of LOCALES) {
      const texts = getTexts(locale);
      for (const text of [
        ...SITE_PAGES.map((page) => pageDescription(page, texts)),
        imageAlt(texts),
      ]) {
        expect(text).toContain(texts.about.name);
        expect(text).not.toMatch(/[{}]/);
      }
    }
  });

  it("describes each indexed page in its own words", () => {
    for (const locale of LOCALES) {
      const descriptions = INDEXED_PAGES.map((page) =>
        pageDescription(page, getTexts(locale)),
      );
      expect(new Set(descriptions).size).toBe(descriptions.length);
    }
  });
});

describe("canonical addresses", () => {
  it("treats /about as the home page", () => {
    expect(canonicalPath("about")).toBe("/");
    expect(pageMetadata("about").alternates?.canonical).toBe("/");
  });

  it("keeps every other page on its own address", () => {
    expect(canonicalPath("career")).toBe("/career");
    expect(canonicalPath("simple")).toBe("/simple");
    expect(canonicalPath("query")).toBe("/query");
    expect(pageMetadata("projects")).toMatchObject({
      title: "Projetos | Mikhael Groschitz Costa",
      alternates: { canonical: "/projects" },
    });
  });
});

describe("site metadata", () => {
  it("resolves addresses against the site domain", () => {
    expect(String(siteMetadata().metadataBase)).toBe(`${SITE_URL}/`);
  });

  it("shares pages in Portuguese, with English as the alternate", () => {
    expect(siteMetadata().openGraph).toMatchObject({
      type: "website",
      locale: "pt_BR",
      alternateLocale: ["en_US"],
    });
    expect(siteMetadata().twitter).toEqual({ card: "summary_large_image" });
  });
});

describe("sitemap and robots", () => {
  it("lists each indexed page once, without /about and /query", () => {
    expect(sitemap().map((entry) => entry.url)).toEqual([
      `${SITE_URL}/`,
      `${SITE_URL}/tech-stack`,
      `${SITE_URL}/career`,
      `${SITE_URL}/projects`,
      `${SITE_URL}/beyond-the-terminal`,
      `${SITE_URL}/contact`,
      `${SITE_URL}/resume`,
      `${SITE_URL}/simple`,
    ]);
  });

  it("lets every crawler in and points to the sitemap", () => {
    expect(robots()).toEqual({
      rules: { userAgent: "*", allow: "/" },
      sitemap: `${SITE_URL}/sitemap.xml`,
    });
  });
});
