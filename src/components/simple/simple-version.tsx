import { LanguageToggle } from "@/components/locale/language-toggle";
import { LocaleBlocks } from "@/components/locale/locale-blocks";
import { getTexts } from "@/content";
import { SimpleContent } from "./simple-content";
import styles from "./simple.module.css";

const switchLanguageLabels = {
  "pt-BR": getTexts("pt-BR").simpleVersion.switchLanguage,
  en: getTexts("en").simpleVersion.switchLanguage,
};

export function SimpleVersion() {
  return (
    <main className={styles.page}>
      <div className={styles.toolbar}>
        <LanguageToggle labels={switchLanguageLabels} />
      </div>
      <LocaleBlocks>
        {(locale) => <SimpleContent locale={locale} />}
      </LocaleBlocks>
    </main>
  );
}
