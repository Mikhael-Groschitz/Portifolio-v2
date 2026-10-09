"use client";

import { LocaleText } from "@/components/locale/locale-text";
import { type Localized, mapLocalized } from "@/content/locales";
import type { DocumentId } from "./section-routes";
import { useWorkspace } from "./workspace-context";

export function PageHeading({
  headings,
}: Readonly<{ headings: Localized<Record<DocumentId, string>> }>) {
  const { activeDocument } = useWorkspace();

  return (
    <h1 className="visually-hidden">
      <LocaleText
        text={mapLocalized(headings, (heading) => heading[activeDocument])}
      />
    </h1>
  );
}
