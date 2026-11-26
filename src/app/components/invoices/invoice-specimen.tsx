"use client";
import { useState } from "react";
import { InvoiceForm } from "@/app/(signed-in)/invoices/invoice-form";
import type { InvoiceClinicState } from "@/app/(signed-in)/invoices/invoice-contracts";
import { Select } from "@/lib/components/select/select";

const scenarios: Record<string, InvoiceClinicState> = {
  ready: {
    status: "ready",
    clinics: [
      {
        id: "1",
        name: "Clínica de prueba activa",
        active: true,
        templateName: "ejemplo.pdf",
      },
      {
        id: "2",
        name: "Clínica de prueba inactiva",
        active: false,
        templateName: null,
      },
    ],
  },
  empty: { status: "ready", clinics: [] },
  loading: { status: "loading" },
  failure: { status: "failure" },
};
export function InvoiceSpecimen() {
  const [scenario, setScenario] = useState("ready");
  return (
    <div className="space-y-6">
      <p>Datos sintéticos de desarrollo. No se genera ningún PDF.</p>
      <Select
        label="Escenario de desarrollo"
        value={scenario}
        options={Object.keys(scenarios).map((value) => ({
          value,
          label: value,
        }))}
        onChange={(event) => setScenario(event.currentTarget.value)}
      />
      <InvoiceForm today="26/11/2026" state={scenarios[scenario]} />
    </div>
  );
}
