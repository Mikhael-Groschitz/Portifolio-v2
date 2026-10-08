import { ReadyIcon } from "@/components/icons";
import { LocaleText } from "@/components/locale/locale-text";
import { localize } from "@/content";
import styles from "./bars.module.css";

export function StatusBar() {
  return (
    <footer className={styles.statusBar}>
      <ReadyIcon />
      <LocaleText text={localize((texts) => texts.shell.status.ready)} />
    </footer>
  );
}
