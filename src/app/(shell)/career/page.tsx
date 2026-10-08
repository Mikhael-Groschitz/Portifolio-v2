import { SectionDocument } from "@/components/editor/section-document";
import { sectionMetadata } from "../section-metadata";

export const metadata = sectionMetadata("career");

export default function CareerPage() {
  return <SectionDocument section="career" />;
}
