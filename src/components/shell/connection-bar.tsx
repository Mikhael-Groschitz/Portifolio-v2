import { ConnectedIcon } from "@/components/icons";
import { LocaleText } from "@/components/locale/locale-text";
import { localize } from "@/content";
import { formatCount } from "@/content/format";
import { mapLocalized } from "@/content/locales";
import { DATABASE, SERVER } from "@/engine/catalog";
import styles from "./bars.module.css";

export function ConnectionBar({ rowCount }: Readonly<{ rowCount: number }>) {
  const text = localize((texts) => texts.shell.connection);

  return (
    <div className={styles.connectionBar}>
      <span className={styles.connectionStatus}>
        <ConnectedIcon />
        <LocaleText text={mapLocalized(text, (bar) => bar.connected)} />
      </span>
      <span className={`${styles.segment} ${styles.detail}`}>
        {`${SERVER.name} (${SERVER.version} RTM)`}
      </span>
      <span className={`${styles.segment} ${styles.detail}`}>
        <LocaleText text={mapLocalized(text, (bar) => bar.login)} />
      </span>
      <span className={styles.segment}>{DATABASE}</span>
      <span className={styles.segment}>00:00:00</span>
      <span className={styles.segment}>
        <LocaleText
          text={mapLocalized(text, (bar) => formatCount(bar.rows, rowCount))}
        />
      </span>
    </div>
  );
}
