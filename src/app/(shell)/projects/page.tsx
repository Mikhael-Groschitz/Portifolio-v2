import { SectionDocument } from "@/components/editor/section-document";
import { sectionMetadata } from "../section-metadata";

export const metadata = sectionMetadata("projects");

export default function ProjectsPage() {
  return <SectionDocument section="projects" />;
}
