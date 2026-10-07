import Link from "next/link";
import styles from "./page.module.css";

export default function Home() {
  return (
    <main className={styles.main}>
      <h1>Portfólio v2</h1>
      <p>
        Oi! O site ainda está em construção. Enquanto isso, dá para conferir a{" "}
        <Link href="/palette">paleta de cores</Link> que vai vestir a interface.
      </p>
    </main>
  );
}
