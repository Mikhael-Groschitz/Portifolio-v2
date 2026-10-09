import { pageMetadata } from "@/app/site-metadata";
import { SectionDocument } from "@/components/editor/section-document";

export const metadata = pageMetadata("projects");

export default function ProjectsPage() {
  return <SectionDocument section="projects" />;
}
