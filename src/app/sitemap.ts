import type { MetadataRoute } from "next";
import { INDEXED_PAGES, SITE_URL, canonicalPath } from "./site-metadata";

export default function sitemap(): MetadataRoute.Sitemap {
  return INDEXED_PAGES.map((page) => ({
    url: new URL(canonicalPath(page), SITE_URL).href,
  }));
}
