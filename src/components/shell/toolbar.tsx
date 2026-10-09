import Link from "next/link";
import { SimpleVersionIcon } from "@/components/icons";
import { LocaleText } from "@/components/locale/locale-text";
import { localize } from "@/content";
import { mapLocalized } from "@/content/locales";
import { DATABASE } from "@/engine/catalog";
import { ExecuteButton } from "./execute-button";
import { ExplorerToggle } from "./explorer-toggle";
import { NewQueryButton } from "./new-query-button";
import styles from "./toolbar.module.css";

export function Toolbar() {
  const text = localize((texts) => texts.shell.toolbar);

  return (
    <div className={styles.toolbar}>
      <ExplorerToggle label={localize((texts) => texts.shell.explorer.title)} />
      <NewQueryButton
        label={mapLocalized(text, (toolbar) => toolbar.newQuery)}
      />
      <span className={styles.separator} aria-hidden="true" />
      <label className={styles.database}>
        <span className="visually-hidden">
          <LocaleText
            text={mapLocalized(text, (toolbar) => toolbar.databases)}
          />
        </span>
        <select className={styles.select} defaultValue={DATABASE}>
          <option value={DATABASE}>{DATABASE}</option>
        </select>
      </label>
      <ExecuteButton label={mapLocalized(text, (toolbar) => toolbar.execute)} />
      <span className={styles.separator} aria-hidden="true" />
      <Link href="/simple" className={`${styles.button} ${styles.simple}`}>
        <SimpleVersionIcon />
        <LocaleText
          text={mapLocalized(text, (toolbar) => toolbar.simpleVersion)}
        />
      </Link>
    </div>
  );
}
