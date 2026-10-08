import { useId } from "react";
import type { ConnectText } from "@/content/types";
import styles from "./connect-dialog.module.css";

const MAX_LENGTH = 300;

interface ParametersFieldProps {
  text: ConnectText["parameters"];
  value: string;
  onChange: (value: string) => void;
}

export function ParametersField({
  text,
  value,
  onChange,
}: Readonly<ParametersFieldProps>) {
  const id = useId();

  return (
    <>
      <label htmlFor={id} className={styles.parametersLabel}>
        {text.label}
      </label>
      <textarea
        id={id}
        className={styles.textarea}
        value={value}
        rows={4}
        maxLength={MAX_LENGTH}
        spellCheck={false}
        autoCapitalize="none"
        aria-describedby={`${id}-hint`}
        onChange={(event) => onChange(event.target.value)}
      />
      <p id={`${id}-hint`} className={styles.hint}>
        {text.hint}
      </p>
    </>
  );
}
