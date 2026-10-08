import type { ReactNode } from "react";
import styles from "./connect-dialog.module.css";

interface FieldRowProps {
  label: ReactNode;
  labelId?: string;
  htmlFor?: string;
  indent?: boolean;
  disabled?: boolean;
  children: ReactNode;
}

export function FieldRow({
  label,
  labelId,
  htmlFor,
  indent = false,
  disabled = false,
  children,
}: Readonly<FieldRowProps>) {
  return (
    <div
      className={styles.row}
      data-indent={indent || undefined}
      data-disabled={disabled || undefined}
    >
      {htmlFor ? (
        <label id={labelId} htmlFor={htmlFor} className={styles.label}>
          {label}
        </label>
      ) : (
        <span id={labelId} className={styles.label}>
          {label}
        </span>
      )}
      <div className={styles.control}>{children}</div>
    </div>
  );
}

export function DisabledCheckRow({ label }: Readonly<{ label: ReactNode }>) {
  return (
    <div className={styles.row}>
      <span className={styles.spacer} />
      <label className={styles.check} data-disabled="">
        <input type="checkbox" disabled />
        {label}
      </label>
    </div>
  );
}
