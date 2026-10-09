"use client";

import { useEasterEggs } from "@/components/easter-eggs/easter-egg-context";
import { DATABASE, V1_DATABASE } from "@/engine/catalog";
import styles from "./toolbar.module.css";

export function DatabaseSelect() {
  const { traveling } = useEasterEggs();
  const database = traveling ? V1_DATABASE : DATABASE;

  return (
    <select key={database} className={styles.select} defaultValue={database}>
      <option value={DATABASE}>{DATABASE}</option>
      {traveling && <option value={V1_DATABASE}>{V1_DATABASE}</option>}
    </select>
  );
}
