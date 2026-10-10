import { formatCompletionTime, formatCount } from "@/content/format";
import type { ResultsText } from "@/content/types";
import { type ExecutionOutcome, resultSetsOf } from "@/engine/execute";
import type { QueryHint } from "@/engine/hints";
import styles from "./results.module.css";

interface MessagesPaneProps {
  outcome: ExecutionOutcome;
  text: ResultsText;
  completedAt: Date | null;
}

type ErrorOutcome = Extract<ExecutionOutcome, { kind: "error" }>;

type ResultsOutcome = Extract<ExecutionOutcome, { kind: "results" }>;

function errorLines({ error }: ErrorOutcome, text: ResultsText): string {
  const { number, level, state, line, message } = error;
  const header = text.errorHeader
    .replace("{number}", String(number))
    .replace("{level}", String(level))
    .replace("{state}", String(state))
    .replace("{line}", String(line));
  return `${header}\n${message}`;
}

function hintLine(hint: QueryHint, text: ResultsText): string {
  switch (hint.kind) {
    case "similar":
      return text.similarHint.replace("{command}", hint.command);
    case "help":
      return text.helpHint.replace("{command}", hint.command);
    case "offline":
      return text.offlineHint;
    case "date":
      return text.dateHint;
  }
}

function effectLines(
  { effect, database }: ResultsOutcome,
  text: ResultsText,
): string[] {
  const changed = text.databaseChanged.replace("{database}", database);
  switch (effect) {
    case "travel":
      return [changed, text.travelFarewell];
    case "return":
      return [changed, text.returned];
    case "regenerate":
      return [text.regenerated];
    case "game":
      return [text.gameStarted];
    default:
      return [];
  }
}

function resultLines(outcome: ResultsOutcome, text: ResultsText): string {
  const blocks = [
    ...resultSetsOf(outcome).map((resultSet) =>
      formatCount(text.rowsAffected, resultSet.rows.length),
    ),
    effectLines(outcome, text).join("\n"),
  ].filter(Boolean);
  return blocks.length > 0 ? blocks.join("\n\n") : text.commandsCompleted;
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
          {`\n\n${hintLine(outcome.hint, text)}`}
        </>
      ) : (
        resultLines(outcome, text)
      )}
      {completion}
    </pre>
  );
}
