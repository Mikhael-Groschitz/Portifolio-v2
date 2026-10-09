"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import type { Localized } from "@/content/locales";
import { useLanguage } from "./language-context";

export function DocumentTitle({
  titles,
}: Readonly<{ titles: Readonly<Record<string, Localized>> }>) {
  const pathname = usePathname();
  const { locale } = useLanguage();
  const title = titles[pathname]?.[locale];

  useEffect(() => {
    if (!title) {
      return;
    }
    const keepTitle = () => {
      if (document.title !== title) {
        document.title = title;
      }
    };
    keepTitle();
    const observer = new MutationObserver(keepTitle);
    observer.observe(document.head, {
      childList: true,
      characterData: true,
      subtree: true,
    });
    return () => observer.disconnect();
  }, [title]);

  return null;
}
