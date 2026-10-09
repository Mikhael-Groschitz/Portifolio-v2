import { CHEATSHEET_SCRIPT } from "@/components/cheatsheet/cheatsheet-runtime";
import { CONNECTION_SCRIPT } from "@/components/connect/connection-runtime";
import { DocumentTitle } from "@/components/locale/document-title";
import { LanguageProvider } from "@/components/locale/language-context";
import { LOCALE_SCRIPT } from "@/components/locale/locale-runtime";
import { DEFAULT_LOCALE } from "@/content/locales";
import { pageTitlesByPath, siteMetadata } from "./site-metadata";
import "./globals.css";

export const metadata = siteMetadata();

const pageTitles = pageTitlesByPath();

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang={DEFAULT_LOCALE} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: LOCALE_SCRIPT }} />
        <script dangerouslySetInnerHTML={{ __html: CONNECTION_SCRIPT }} />
        <script dangerouslySetInnerHTML={{ __html: CHEATSHEET_SCRIPT }} />
      </head>
      <body>
        <LanguageProvider>
          <DocumentTitle titles={pageTitles} />
          {children}
        </LanguageProvider>
      </body>
    </html>
  );
}
