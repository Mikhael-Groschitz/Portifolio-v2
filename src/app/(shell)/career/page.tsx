import { pageMetadata } from "@/app/site-metadata";
import { SectionDocument } from "@/components/editor/section-document";

export const metadata = pageMetadata("career");

export default function CareerPage() {
  return <SectionDocument section="career" />;
}
