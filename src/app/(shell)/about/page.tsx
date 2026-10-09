import { pageMetadata } from "@/app/site-metadata";
import { SectionDocument } from "@/components/editor/section-document";

export const metadata = pageMetadata("about");

export default function AboutPage() {
  return <SectionDocument section="about" />;
}
