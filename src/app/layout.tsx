import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "TODO: título do site",
  description: "TODO: descrição do site",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
