import type { ReactNode } from "react";
import { ExternalLink } from "@/components/external-link";
import { isPlaceholder } from "@/content/placeholder";

interface ContentLinkProps {
  url: string;
  newTabLabel: string;
  download?: string;
  children: ReactNode;
}

const WEB_URL = /^https?:\/\//;

export function ContentLink({
  url,
  newTabLabel,
  download,
  children,
}: Readonly<ContentLinkProps>) {
  if (isPlaceholder(url)) {
    return (
      <span>
        {children} ({url})
      </span>
    );
  }

  if (WEB_URL.test(url)) {
    return (
      <ExternalLink href={url} newTabLabel={newTabLabel}>
        {children}
      </ExternalLink>
    );
  }

  return (
    <a href={url} download={download}>
      {children}
    </a>
  );
}
