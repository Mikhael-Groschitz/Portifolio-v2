import { pageMetadata } from "@/app/site-metadata";
import { SectionDocument } from "@/components/editor/section-document";

export const metadata = pageMetadata("contact");

export default function ContactPage() {
  return <SectionDocument section="contact" />;
}
