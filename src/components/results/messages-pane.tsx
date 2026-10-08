import styles from "./results.module.css";

export function MessagesPane({
  lines,
}: Readonly<{ lines: readonly string[] }>) {
  return <pre className={styles.messages}>{lines.join("\n\n")}</pre>;
}
