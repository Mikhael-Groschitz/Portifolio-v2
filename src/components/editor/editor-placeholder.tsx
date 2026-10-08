import { LocaleBlocks } from "@/components/locale/locale-blocks";
import { getTexts } from "@/content";
import { DEFAULT_LOCALE } from "@/content/locales";
import styles from "./editor.module.css";

export function EditorPlaceholder() {
  const lineCount = getTexts(DEFAULT_LOCALE).shell.editor.placeholder.length;

  return (
    <div className={styles.editor}>
      <div className={styles.gutter} aria-hidden="true">
        {Array.from({ length: lineCount }, (_, index) => (
          <span key={index} className={styles.lineNumber}>
            {index + 1}
          </span>
        ))}
      </div>
      <div className={styles.code}>
        <LocaleBlocks>
          {(locale) => (
            <pre className={styles.pre}>
              {getTexts(locale).shell.editor.placeholder.map((line, index) => (
                <span
                  key={line}
                  className={
                    index === 0
                      ? `${styles.line} ${styles.currentLine}`
                      : styles.line
                  }
                >
                  <span className={styles.comment}>-- {line}</span>
                </span>
              ))}
            </pre>
          )}
        </LocaleBlocks>
      </div>
    </div>
  );
}
