import { CaretDownIcon, CloseIcon, PinIcon } from "@/components/icons";
import { LocaleText } from "@/components/locale/locale-text";
import type { Localized } from "@/content/locales";
import styles from "./editor.module.css";

interface DocumentTabsProps {
  label: Localized;
  title: string;
  tabId: string;
  panelId: string;
}

export function DocumentTabs({
  label,
  title,
  tabId,
  panelId,
}: Readonly<DocumentTabsProps>) {
  const labelId = `${tabId}-list-label`;

  return (
    <div className={styles.tabStrip}>
      <span id={labelId} className="visually-hidden">
        <LocaleText text={label} />
      </span>
      <div role="tablist" aria-labelledby={labelId} className={styles.tabs}>
        <div
          id={tabId}
          role="tab"
          aria-selected="true"
          aria-controls={panelId}
          tabIndex={0}
          className={styles.tab}
        >
          <span className={styles.tabTitle}>{title}</span>
          <span className={styles.tabIcons} aria-hidden="true">
            <PinIcon size={14} />
            <CloseIcon size={14} />
          </span>
        </div>
      </div>
      <span className={styles.stripIcons} aria-hidden="true">
        <CaretDownIcon />
      </span>
    </div>
  );
}
