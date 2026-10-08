import { SectionDocument } from "@/components/editor/section-document";
import { sectionMetadata } from "../section-metadata";

export const metadata = sectionMetadata("contact");

export default function ContactPage() {
  return <SectionDocument section="contact" />;
}
