import { pageMetadata } from "@/app/site-metadata";
import { SectionDocument } from "@/components/editor/section-document";

export const metadata = pageMetadata("beyond-the-terminal");

export default function BeyondTheTerminalPage() {
  return <SectionDocument section="beyond-the-terminal" />;
}
