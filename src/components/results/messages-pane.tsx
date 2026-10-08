import { formatCompletionTime, formatCount } from "@/content/format";
import type { ResultsText } from "@/content/types";
import type { ExecutionOutcome } from "@/engine/execute";
import styles from "./results.module.css";

interface MessagesPaneProps {
  outcome: ExecutionOutcome;
  text: ResultsText;
  completedAt: Date | null;
}

function errorLines(
  { error }: Extract<ExecutionOutcome, { kind: "error" }>,
  text: ResultsText,
) {
  const { number, level, state, line, message } = error;
  const header = text.errorHeader
    .replace("{number}", String(number))
    .replace("{level}", String(level))
    .replace("{state}", String(state))
    .replace("{line}", String(line));
  return `${header}\n${message}`;
}

export function MessagesPane({
  outcome,
  text,
  completedAt,
}: Readonly<MessagesPaneProps>) {
  const completion =
    completedAt &&
    `\n\n${text.completionTime}: ${formatCompletionTime(completedAt)}`;

  return (
    <pre className={styles.messages}>
      {outcome.kind === "error" ? (
        <span className={styles.error}>{errorLines(outcome, text)}</span>
      ) : (
        formatCount(text.rowsAffected, outcome.resultSet.rows.length)
      )}
      {completion}
    </pre>
  );
}
