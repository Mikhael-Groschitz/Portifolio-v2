import { formatCompletionTime, formatCount } from "@/content/format";
import type { ResultsText } from "@/content/types";
import { type ExecutionOutcome, resultSetsOf } from "@/engine/execute";
import styles from "./results.module.css";

interface MessagesPaneProps {
  outcome: ExecutionOutcome;
  text: ResultsText;
  completedAt: Date | null;
}

type ErrorOutcome = Extract<ExecutionOutcome, { kind: "error" }>;

function errorLines({ error }: ErrorOutcome, text: ResultsText): string {
  const { number, level, state, line, message } = error;
  const header = text.errorHeader
    .replace("{number}", String(number))
    .replace("{level}", String(level))
    .replace("{state}", String(state))
    .replace("{line}", String(line));
  return `${header}\n${message}`;
}

function hintLine({ hint }: ErrorOutcome, text: ResultsText): string {
  const template = hint.similar ? text.similarHint : text.helpHint;
  return template.replace("{command}", hint.command);
}

function resultLines(outcome: ExecutionOutcome, text: ResultsText): string {
  const resultSets = resultSetsOf(outcome);
  if (resultSets.length === 0) {
    return text.commandsCompleted;
  }
  return resultSets
    .map((resultSet) => formatCount(text.rowsAffected, resultSet.rows.length))
    .join("\n\n");
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
        <>
          <span className={styles.error}>{errorLines(outcome, text)}</span>
          {`\n\n${hintLine(outcome, text)}`}
        </>
      ) : (
        resultLines(outcome, text)
      )}
      {completion}
    </pre>
  );
}
