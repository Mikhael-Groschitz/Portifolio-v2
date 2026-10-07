import type { ReactNode } from "react";

interface ExternalLinkProps {
  href: string;
  newTabLabel: string;
  children: ReactNode;
  className?: string;
}

export function ExternalLink({
  href,
  newTabLabel,
  children,
  className,
}: Readonly<ExternalLinkProps>) {
  return (
    <a
      href={href}
      className={className}
      target="_blank"
      rel="noopener noreferrer"
    >
      {children}
      <span className="visually-hidden"> ({newTabLabel})</span>
    </a>
  );
}
