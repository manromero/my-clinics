"use client";

import { useState } from "react";
import { Alert } from "@/lib/components/alert/alert";
import { Button } from "@/lib/components/button/button";

export function AlertSpecimen() {
  const [result, setResult] = useState<"ready" | "error" | "success">("ready");
  const [attempts, setAttempts] = useState(0);
  function simulateFailure() {
    setResult("error");
    setAttempts(0);
  }
  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <Alert title="Información · Ayuda junto al formulario">
          Los cambios se aplican a las nuevas entradas. Las anteriores conservan
          sus valores originales.
        </Alert>
        <Alert variant="success" title="Éxito · Cambios guardados">
          La operación ha finalizado correctamente.
        </Alert>
        <Alert variant="warning" title="Aviso · Revisa los datos">
          Comprueba los valores antes de continuar. Puedes volver atrás para
          corregirlos.
        </Alert>
        <Alert
          variant="error"
          title="Error · No se pudo cargar"
          action={{
            label: "Reintentar carga de ejemplo",
            onClick: simulateFailure,
          }}
        >
          La información no está disponible. Inténtalo de nuevo.
        </Alert>
      </div>
      <div className="rounded-xl bg-surface-container-low p-5 sm:p-6">
        <h4 className="font-headline text-title">Resultado de una operación</h4>
        <p className="mt-3 text-sm leading-6 text-on-surface-variant">
          Simulación local: el primer reintento falla y el segundo termina
          correctamente. No se guardan datos.
        </p>
        <div className="mt-5">
          <Button variant="secondary" onClick={simulateFailure}>
            Simular fallo al guardar
          </Button>
        </div>
        <div className="mt-5 space-y-4">
          <Alert
            variant={result === "error" ? "error" : "info"}
            title={
              result === "error"
                ? "No se pudo guardar"
                : "Errores de la operación"
            }
            announcement="assertive"
            action={
              result === "error"
                ? {
                    label: "Reintentar guardado",
                    onClick: () => {
                      setAttempts(attempts + 1);
                      if (attempts >= 1) setResult("success");
                    },
                  }
                : undefined
            }
          >
            {result === "error"
              ? `Conservamos los valores introducidos para que puedas reintentar. Intentos fallidos: ${attempts + 1}.`
              : "No hay errores pendientes."}
          </Alert>
          <Alert
            variant={result === "success" ? "success" : "info"}
            title={
              result === "success"
                ? "Cambios guardados"
                : "Estado de la operación"
            }
            announcement="polite"
          >
            {result === "success"
              ? "El reintento se ha completado correctamente. Los valores del ejemplo están disponibles."
              : result === "ready"
                ? "Pulsa el botón para probar el fallo y el reintento."
                : "Pendiente de reintento."}
          </Alert>
        </div>
      </div>
      <p className="text-sm leading-6 text-on-surface-variant">
        API: title da nombre al mensaje y children contiene la explicación.
        variant admite info (por defecto), success, warning y error.
        announcement es off por defecto para texto estático; polite usa status y
        assertive usa alert. Mantén la región montada y cambia su contenido para
        anunciar resultados nuevos; reserva assertive para fallos urgentes.
        action admite label, onClick, disabled y pending. Admite atributos de
        div, className y ref. Las acciones quedan fuera del anuncio.
      </p>
    </div>
  );
}
