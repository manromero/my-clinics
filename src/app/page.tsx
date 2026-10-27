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
      <section
        aria-labelledby="example-title"
        className="mt-10 max-w-lg rounded-2xl border border-emerald-200 bg-white p-6 shadow-sm sm:p-8"
      >
        <p className="text-xs font-semibold tracking-widest text-emerald-700 uppercase">
          Vista de ejemplo
        </p>
        <h2
          id="example-title"
          className="mt-3 text-2xl font-bold tracking-tight text-emerald-950"
        >
          Un espacio para cada clínica
        </h2>
        <p className="mt-3 text-base leading-relaxed text-slate-600">
          Organiza tus clínicas y consulta tu actividad e ingresos con una
          visión clara de tu trabajo.
        </p>
      </section>
    </main>
  );
}
