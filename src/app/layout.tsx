import type { Metadata } from "next";
import { CONNECTION_SCRIPT } from "@/components/connect/connection-runtime";
import { LanguageProvider } from "@/components/locale/language-context";
import { LOCALE_SCRIPT } from "@/components/locale/locale-runtime";
import { getTexts } from "@/content";
import { DEFAULT_LOCALE } from "@/content/locales";
import "./globals.css";

const { about } = getTexts(DEFAULT_LOCALE);

export const metadata: Metadata = {
  title: `${about.name} | ${about.role}`,
  description: "TODO: descrição do site",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang={DEFAULT_LOCALE} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: LOCALE_SCRIPT }} />
        <script dangerouslySetInnerHTML={{ __html: CONNECTION_SCRIPT }} />
      </head>
      <body>
        <LanguageProvider>{children}</LanguageProvider>
      </body>
    </html>
  );
}
