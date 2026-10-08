import { AppIcon } from "@/components/icons";
import { LanguageToggle } from "@/components/locale/language-toggle";
import { nextLocale } from "@/components/locale/locale-runtime";
import { LocaleText } from "@/components/locale/locale-text";
import { localize } from "@/content";
import { byLocale } from "@/content/locales";
import { MenuBar } from "./menu-bar";
import styles from "./title-bar.module.css";

export function TitleBar() {
  const languageNames = localize((texts) => texts.shell.languageName);

  return (
    <header className={styles.titleBar}>
      <AppIcon size={20} className={styles.appIcon} />
      <MenuBar
        text={localize((texts) => texts.shell.menu)}
        languageNames={languageNames}
      />
      <span className={styles.windowTitle}>
        <LocaleText text={localize((texts) => texts.shell.windowTitle)} />
      </span>
      <LanguageToggle
        labels={byLocale((locale) => languageNames[nextLocale(locale)])}
        className={styles.language}
      />
    </header>
  );
}
