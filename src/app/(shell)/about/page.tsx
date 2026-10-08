import { SectionDocument } from "@/components/editor/section-document";
import { sectionMetadata } from "../section-metadata";

export const metadata = sectionMetadata("about");

export default function AboutPage() {
  return <SectionDocument section="about" />;
}
