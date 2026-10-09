import { pageMetadata } from "@/app/site-metadata";
import { SimpleVersion } from "@/components/simple/simple-version";

export const metadata = pageMetadata("simple");

export default function SimplePage() {
  return <SimpleVersion />;
}
