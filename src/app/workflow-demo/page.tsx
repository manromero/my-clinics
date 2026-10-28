"use client";

import { useState } from "react";

export default function WorkflowDemoPage() {
  const [completed, setCompleted] = useState(false);

  return (
    <main className="flex min-h-dvh items-center justify-center bg-[#faf9fa] px-5 py-12 font-sans text-[#1a1c1c] sm:px-8">
      <section
        aria-labelledby="workflow-title"
        className="w-full max-w-xl rounded-3xl bg-white p-8 sm:p-12"
      >
        <p className="mb-4 text-xs font-semibold tracking-widest text-[#6d5e00] uppercase">
          MyClinics · Prueba temporal
        </p>
        <h1
          id="workflow-title"
          className="font-serif text-3xl leading-tight font-bold tracking-tight sm:text-4xl"
        >
          Prueba del flujo
        </h1>
        <p className="mt-5 text-base leading-7 text-[#45464f]">
          Completa esta prueba para comprobar el cambio de estado. Puedes
          reiniciarla y volver a probar cuando quieras.
        </p>

        <div className="my-8 rounded-2xl bg-[#f4f3f4] p-6">
          <p className="text-xs font-semibold tracking-wider text-[#45464f] uppercase">
            Estado de la prueba
          </p>
          <p
            role="status"
            aria-live="polite"
            aria-atomic="true"
            className="mt-2 text-xl font-semibold"
          >
            {completed ? "Completado" : "Pendiente"}
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            disabled={completed}
            onClick={() => setCompleted(true)}
            className="min-h-12 cursor-pointer rounded-xl bg-linear-to-r from-[#094cb2] to-[#3165c9] px-6 py-3 text-sm font-semibold text-white hover:brightness-95 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#094cb2] disabled:cursor-default disabled:bg-[#dfe3e8] disabled:bg-none disabled:text-[#45464f] disabled:brightness-100"
          >
            Completar prueba
          </button>
          <button
            type="button"
            onClick={() => setCompleted(false)}
            className="min-h-12 cursor-pointer rounded-xl bg-[#e8e7e8] px-6 py-3 text-sm font-semibold text-[#094cb2] hover:bg-[#dedddd] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#094cb2]"
          >
            Reiniciar
          </button>
        </div>
      </section>
    </main>
  );
}
