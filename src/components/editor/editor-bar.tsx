import { CaretDownIcon, CheckCircleIcon } from "@/components/icons";
import { LocaleText } from "@/components/locale/locale-text";
import { localize } from "@/content";
import { mapLocalized } from "@/content/locales";
import styles from "./editor.module.css";

export function EditorBar() {
  const text = localize((texts) => texts.shell.editor);

  return (
    <div className={styles.editorBar}>
      <span className={styles.zoom} aria-hidden="true">
        100 %
        <CaretDownIcon size={14} />
      </span>
      <span className={styles.issues}>
        <CheckCircleIcon size={14} />
        <LocaleText text={mapLocalized(text, (editor) => editor.noIssues)} />
      </span>
      <span className={styles.position}>
        <LocaleText
          text={mapLocalized(text, (editor) => `${editor.line}: 1`)}
        />
        <LocaleText
          text={mapLocalized(text, (editor) => `${editor.column}: 1`)}
        />
      </span>
    </div>
  );
}
