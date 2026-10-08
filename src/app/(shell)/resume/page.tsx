import { SectionDocument } from "@/components/editor/section-document";
import { sectionMetadata } from "../section-metadata";

export const metadata = sectionMetadata("resume");

export default function ResumePage() {
  return <SectionDocument section="resume" />;
}
