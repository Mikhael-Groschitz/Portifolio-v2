import { pageMetadata } from "@/app/site-metadata";
import { SectionDocument } from "@/components/editor/section-document";

export const metadata = pageMetadata("tech-stack");

export default function TechStackPage() {
  return <SectionDocument section="tech-stack" />;
}
