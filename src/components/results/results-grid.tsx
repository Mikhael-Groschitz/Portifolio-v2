import styles from "./results.module.css";

export interface GridColumn<Key extends string> {
  key: Key;
  header: string;
  wrap?: boolean;
}

interface ResultsGridProps<Key extends string> {
  caption: string;
  rowNumberLabel: string;
  columns: readonly GridColumn<Key>[];
  rows: readonly Readonly<Record<Key, string>>[];
}

export function ResultsGrid<Key extends string>({
  caption,
  rowNumberLabel,
  columns,
  rows,
}: Readonly<ResultsGridProps<Key>>) {
  return (
    <table className={styles.grid}>
      <caption className="visually-hidden">{caption}</caption>
      <thead>
        <tr>
          <th scope="col" className={styles.rowNumber}>
            <span className="visually-hidden">{rowNumberLabel}</span>
          </th>
          {columns.map((column) => (
            <th key={column.key} scope="col">
              {column.header}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row, index) => (
          <tr key={index}>
            <th scope="row" className={styles.rowNumber}>
              {index + 1}
            </th>
            {columns.map((column) => (
              <td
                key={column.key}
                className={column.wrap ? styles.wrap : undefined}
              >
                {row[column.key]}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
