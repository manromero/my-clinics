"use client";

import { useState } from "react";
import { ClinicForm } from "../../(signed-in)/clinics/clinic-form";
import { Button } from "@/lib/components/button/button";

export function ClinicTemplateSpecimen() {
  const [mode, setMode] = useState<"create" | "edit">();
  const [fail, setFail] = useState(false);
  const [message, setMessage] = useState("");
  return (
    <>
      <div className="flex flex-wrap gap-3">
        <Button onClick={() => setMode("create")}>Nueva clínica (demo)</Button>
        <Button onClick={() => setMode("edit")}>Editar clínica (demo)</Button>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={fail}
            onChange={(e) => setFail(e.target.checked)}
          />
          Simular fallo en el próximo guardado
        </label>
      </div>
      <p role="status">{message}</p>
      {mode && (
        <ClinicForm
          key={mode}
          clinic={
            mode === "edit"
              ? {
                  id: "demo",
                  name: "Clínica sintética",
                  percentage: 40,
                  active: true,
                }
              : undefined
          }
          save={async () => {
            throw Error("Use demo save");
          }}
          templateDemo={{
            stored:
              mode === "edit"
                ? { id: "synthetic", name: "plantilla-guardada.pdf" }
                : undefined,
            save: async (_data, intent) => {
              await new Promise((resolve) => setTimeout(resolve, 350));
              if (fail) {
                setFail(false);
                return { status: "failed" };
              }
              setMessage(
                `Guardado simulado: ${intent.kind === "replace" ? `reemplazo ${intent.file.name}` : intent.kind === "remove" ? "eliminación" : "sin cambios"}. No se ha persistido ningún archivo.`,
              );
              return { status: "saved" };
            },
          }}
          onSaved={() => setMode(undefined)}
          onCancel={() => {
            setMode(undefined);
            setMessage("Cancelado. La plantilla guardada no cambia.");
          }}
        />
      )}
    </>
  );
}
