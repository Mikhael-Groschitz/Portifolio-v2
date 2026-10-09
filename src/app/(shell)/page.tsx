import { pageMetadata } from "@/app/site-metadata";
import { SectionDocument } from "@/components/editor/section-document";
import { HOME_SECTION } from "@/components/shell/section-routes";

export const metadata = pageMetadata(HOME_SECTION);

export default function HomePage() {
  return <SectionDocument section={HOME_SECTION} />;
}
