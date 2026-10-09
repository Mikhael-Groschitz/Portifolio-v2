import type { Metadata } from "next";
import { pageMetadata } from "@/app/site-metadata";
import { QueryEditor } from "@/components/editor/query-editor";
import { localize } from "@/content";

export const metadata: Metadata = {
  ...pageMetadata("query"),
  robots: { index: false },
};

export default function QueryPage() {
  return <QueryEditor text={localize((texts) => texts.shell.query)} />;
}
