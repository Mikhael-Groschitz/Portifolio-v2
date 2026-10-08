import {
  ActivityIcon,
  CaretDownIcon,
  CloseIcon,
  DisconnectIcon,
  FilterIcon,
  PinIcon,
  PlugIcon,
  RefreshIcon,
  StopIcon,
} from "@/components/icons";
import { LocaleText } from "@/components/locale/locale-text";
import { localize } from "@/content";
import { mapLocalized } from "@/content/locales";
import { ExplorerCloseButton } from "./explorer-close-button";
import { explorerNodes } from "./explorer-nodes";
import { ObjectExplorerTree } from "./object-explorer-tree";
import styles from "./object-explorer.module.css";

const TITLE_ID = "object-explorer-title";

export function ObjectExplorer() {
  const text = localize((texts) => texts.shell.explorer);

  return (
    <nav className={styles.panel} aria-labelledby={TITLE_ID}>
      <div className={styles.header}>
        <span id={TITLE_ID} className={styles.title}>
          <LocaleText text={mapLocalized(text, (explorer) => explorer.title)} />
        </span>
        <span className={styles.grip} aria-hidden="true" />
        <span className={styles.headerIcons} aria-hidden="true">
          <CaretDownIcon />
          <PinIcon />
          <CloseIcon />
        </span>
        <ExplorerCloseButton
          label={mapLocalized(text, (explorer) => explorer.close)}
        />
      </div>
      <div className={styles.toolbar} aria-hidden="true">
        <span className={styles.connect}>
          <LocaleText
            text={mapLocalized(text, (explorer) => explorer.connect)}
          />
          <CaretDownIcon />
        </span>
        <PlugIcon />
        <DisconnectIcon />
        <StopIcon className={styles.disabledIcon} />
        <FilterIcon className={styles.disabledIcon} />
        <RefreshIcon />
        <ActivityIcon />
      </div>
      <div className={styles.treeScroll}>
        <ObjectExplorerTree nodes={explorerNodes()} labelledBy={TITLE_ID} />
      </div>
    </nav>
  );
}
