import { useId } from "react";
import type { ConnectText } from "@/content/types";
import { DATABASE } from "@/engine/catalog";
import type { ConnectFormValues } from "./connect-form";
import { FieldRow } from "./field-row";
import styles from "./connect-dialog.module.css";

const PACKET_SIZE = 4096;
const CONNECTION_TIMEOUT = 30;
const EXECUTION_TIMEOUT = 0;

interface ConnectionPropertiesProps {
  text: ConnectText["properties"];
  values: ConnectFormValues;
  onChange: (values: ConnectFormValues) => void;
  onReset: () => void;
}

export function ConnectionProperties({
  text,
  values,
  onChange,
  onReset,
}: Readonly<ConnectionPropertiesProps>) {
  const id = useId();

  return (
    <>
      <p className={styles.intro}>{text.intro}</p>
      <FieldRow label={text.database} htmlFor={`${id}-database`}>
        <select
          id={`${id}-database`}
          className={styles.input}
          defaultValue={DATABASE}
        >
          <option value={DATABASE}>{DATABASE}</option>
        </select>
      </FieldRow>
      <fieldset className={styles.group}>
        <legend className={styles.legend}>{text.network}</legend>
        <FieldRow
          label={text.protocol}
          htmlFor={`${id}-protocol`}
          indent
          disabled
        >
          <select
            id={`${id}-protocol`}
            className={styles.input}
            defaultValue="default"
            disabled
          >
            <option value="default">{text.defaultValue}</option>
          </select>
        </FieldRow>
        <FieldRow
          label={text.packetSize}
          htmlFor={`${id}-packet`}
          indent
          disabled
        >
          <input
            id={`${id}-packet`}
            type="number"
            className={`${styles.input} ${styles.number}`}
            defaultValue={PACKET_SIZE}
            disabled
          />
          <span className={styles.unit}>{text.bytes}</span>
        </FieldRow>
      </fieldset>
      <fieldset className={styles.group}>
        <legend className={styles.legend}>{text.connection}</legend>
        <FieldRow
          label={text.connectionTimeout}
          htmlFor={`${id}-connection-timeout`}
          indent
          disabled
        >
          <input
            id={`${id}-connection-timeout`}
            type="number"
            className={`${styles.input} ${styles.number}`}
            defaultValue={CONNECTION_TIMEOUT}
            disabled
          />
          <span className={styles.unit}>{text.seconds}</span>
        </FieldRow>
        <FieldRow
          label={text.executionTimeout}
          htmlFor={`${id}-execution-timeout`}
          indent
          disabled
        >
          <input
            id={`${id}-execution-timeout`}
            type="number"
            className={`${styles.input} ${styles.number}`}
            defaultValue={EXECUTION_TIMEOUT}
            disabled
          />
          <span className={styles.unit}>{text.seconds}</span>
        </FieldRow>
        <div className={styles.row} data-indent="">
          <label className={`${styles.label} ${styles.check}`}>
            <input
              type="checkbox"
              checked={values.useCustomColor}
              onChange={(event) =>
                onChange({ ...values, useCustomColor: event.target.checked })
              }
            />
            {text.customColor}
          </label>
          <div className={styles.control}>
            <input
              id={`${id}-color`}
              type="color"
              className={styles.colorInput}
              value={values.color ?? ""}
              disabled={!values.useCustomColor}
              onChange={(event) =>
                onChange({ ...values, color: event.target.value })
              }
            />
            <label
              htmlFor={`${id}-color`}
              className={styles.button}
              data-disabled={values.useCustomColor ? undefined : ""}
            >
              {text.selectColor}
            </label>
          </div>
        </div>
      </fieldset>
      <div className={styles.resetRow}>
        <button type="button" className={styles.button} onClick={onReset}>
          {text.resetAll}
        </button>
      </div>
    </>
  );
}
