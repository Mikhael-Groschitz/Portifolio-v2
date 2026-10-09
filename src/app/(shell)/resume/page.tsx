import { pageMetadata } from "@/app/site-metadata";
import { SectionDocument } from "@/components/editor/section-document";

export const metadata = pageMetadata("resume");

export default function ResumePage() {
  return <SectionDocument section="resume" />;
}
