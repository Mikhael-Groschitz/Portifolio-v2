"use client";

import { useState } from "react";
import { ExternalLink } from "@/components/external-link";
import type { Cell, ResultSet } from "@/engine/execute";
import styles from "./results.module.css";

const WEB_URL = /^https?:\/\//;

interface ResultsGridProps {
  resultSet: ResultSet;
  rowNumberLabel: string;
  newTabLabel: string;
}

function CellContent({
  cell,
  newTabLabel,
}: Readonly<{ cell: Cell; newTabLabel: string }>) {
  if (cell.kind === "null") {
    return <span className={styles.null}>NULL</span>;
  }
  if (cell.kind === "text") {
    return cell.text;
  }
  if (WEB_URL.test(cell.href)) {
    return (
      <ExternalLink href={cell.href} newTabLabel={newTabLabel}>
        {cell.text}
      </ExternalLink>
    );
  }
  return (
    <a href={cell.href} download={cell.download}>
      {cell.text}
    </a>
  );
}

export function ResultsGrid({
  resultSet,
  rowNumberLabel,
  newTabLabel,
}: Readonly<ResultsGridProps>) {
  const [selected, setSelected] = useState({ row: 0, column: 0 });

  return (
    <table role="table" className={styles.grid}>
      <caption className="visually-hidden">{resultSet.source}</caption>
      <thead role="rowgroup">
        <tr role="row">
          <th role="columnheader" scope="col" className={styles.rowNumber}>
            <span className="visually-hidden">{rowNumberLabel}</span>
          </th>
          {resultSet.columns.map((column) => (
            <th key={column.name} role="columnheader" scope="col">
              {column.name}
            </th>
          ))}
        </tr>
      </thead>
      <tbody role="rowgroup">
        {resultSet.rows.map((cells, row) => (
          <tr key={row} role="row">
            <th
              role="rowheader"
              scope="row"
              data-label={rowNumberLabel}
              className={styles.rowNumber}
            >
              {row + 1}
            </th>
            {cells.map((cell, column) => {
              const { name, type } = resultSet.columns[column];
              const classes = [
                type === "long" ? styles.wrap : "",
                selected.row === row && selected.column === column
                  ? styles.selected
                  : "",
              ].filter(Boolean);
              return (
                <td
                  key={name}
                  role="cell"
                  data-label={name}
                  className={classes.join(" ") || undefined}
                  onClick={() => setSelected({ row, column })}
                >
                  <CellContent cell={cell} newTabLabel={newTabLabel} />
                </td>
              );
            })}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
