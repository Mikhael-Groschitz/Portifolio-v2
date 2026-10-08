import { SectionDocument } from "@/components/editor/section-document";
import { sectionMetadata } from "../section-metadata";

export const metadata = sectionMetadata("tech-stack");

export default function TechStackPage() {
  return <SectionDocument section="tech-stack" />;
}
