import { SectionDocument } from "@/components/editor/section-document";
import { sectionMetadata } from "../section-metadata";

export const metadata = sectionMetadata("beyond-the-terminal");

export default function BeyondTheTerminalPage() {
  return <SectionDocument section="beyond-the-terminal" />;
}
