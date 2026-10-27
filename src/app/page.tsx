import styles from "./page.module.css";

export default function Home() {
  return (
    <main className={styles.main}>
      <p className={styles.eyebrow}>GESTIÓN DENTAL</p>
      <h1 className={styles.title}>MyClinics</h1>
      <p className={styles.description}>
        Tus clínicas, tu actividad y tus ingresos, en un solo lugar.
      </p>
      <p className={styles.status}>Proyecto en desarrollo</p>
    </main>
  );
}
