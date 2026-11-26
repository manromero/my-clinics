"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/lib/components/button/button";
import { TextInput } from "@/lib/components/text-input/text-input";
import { DateInput } from "@/lib/components/date-input/date-input";
import { DecimalInput } from "@/lib/components/decimal-input/decimal-input";
import { Select } from "@/lib/components/select/select";
import { Surface } from "@/lib/components/surface/surface";
import { LoadingState } from "@/lib/components/loading-state/loading-state";
import { Alert } from "@/lib/components/alert/alert";
import { invoiceFields, type InvoiceClinicState } from "./invoice-contracts";

export function InvoiceForm({
  today,
  state,
}: {
  today: string;
  state: InvoiceClinicState;
}) {
  const [number, setNumber] = useState("");
  const [date, setDate] = useState(today);
  const [gross, setGross] = useState("");
  const [clinicId, setClinicId] = useState("");
  const [touched, setTouched] = useState({
    number: false,
    date: false,
    gross: false,
  });
  const router = useRouter();
  const clinics = state.status === "ready" ? state.clinics : [];
  const clinic = clinics.find(({ id }) => id === clinicId);
  const fields = invoiceFields({ number, date, gross });
  return (
    <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
      <Surface as="section" aria-labelledby="invoice-form-title">
        <form
          className="space-y-6"
          onSubmit={(event) => event.preventDefault()}
          noValidate
        >
          <div className="space-y-2">
            <p className="font-label text-caption font-semibold uppercase tracking-widest text-primary">
              Datos de emisión
            </p>
            <h2
              id="invoice-form-title"
              className="font-headline text-title font-semibold"
            >
              Nueva factura
            </h2>
            <p className="text-on-surface-variant">
              Introduce los datos de la factura y revisa el cálculo.
            </p>
          </div>
          {state.status === "loading" && (
            <LoadingState label="Cargando clínicas…" />
          )}
          {state.status === "failure" && (
            <Alert
              title="No se han podido cargar las clínicas"
              action={{ label: "Reintentar", onClick: () => router.refresh() }}
            >
              Los datos introducidos se conservan al reintentar.
            </Alert>
          )}
          <Select
            label="Clínica"
            required
            value={clinicId}
            placeholder="Selecciona una clínica"
            disabled={state.status !== "ready" || clinics.length === 0}
            options={clinics.map((item) => ({
              value: item.id,
              label: `${item.name}${item.active ? "" : " · Inactiva"}`,
            }))}
            onChange={(event) => setClinicId(event.currentTarget.value)}
          />
          {state.status === "unavailable" && (
            <p className="text-sm text-on-surface-variant">
              La selección de clínicas y sus plantillas estará disponible
              próximamente.
            </p>
          )}
          {state.status === "ready" && clinics.length === 0 && (
            <p className="text-on-surface-variant">
              Todavía no hay clínicas.{" "}
              <Link className="text-primary underline" href="/clinics">
                Crear una clínica
              </Link>
              .
            </p>
          )}
          {clinic && (
            <p className="rounded-lg bg-surface-container-low p-3 text-sm text-on-surface-variant">
              {clinic.templateName ? (
                `Plantilla: ${clinic.templateName}`
              ) : (
                <>
                  Esta clínica no tiene plantilla. La asignación de plantillas
                  desde{" "}
                  <Link className="text-primary underline" href="/clinics">
                    Clínicas
                  </Link>{" "}
                  estará disponible próximamente.
                </>
              )}
            </p>
          )}
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
            <TextInput
              label="Número de factura"
              required
              inputMode="numeric"
              value={number}
              help="De 1 a 9999, hasta cuatro dígitos. Se conservan los ceros iniciales."
              error={
                touched.number && !fields.invoice_number
                  ? "Introduce de uno a cuatro dígitos, con valor mayor que cero."
                  : undefined
              }
              onChange={(event) => {
                setNumber(event.currentTarget.value);
                setTouched((old) => ({ ...old, number: false }));
              }}
              onBlur={() => setTouched((old) => ({ ...old, number: true }))}
            />
            <DateInput
              label="Fecha de emisión"
              required
              inputFormat="dd/MM/yyyy"
              value={date}
              help="dd/MM/yyyy · Hoy en Europe/Madrid."
              error={
                touched.date && !fields.issue_date
                  ? "Introduce una fecha válida en formato dd/MM/yyyy."
                  : undefined
              }
              onChange={(event) => {
                setDate(event.currentTarget.value);
                setTouched((old) => ({ ...old, date: false }));
              }}
              onBlur={() => setTouched((old) => ({ ...old, date: true }))}
            />
          </div>
          <DecimalInput
            label="Importe bruto"
            required
            value={gross}
            allowNegative={false}
            min="0.01"
            adornment="€"
            help="Importe profesional, sin aplicar porcentajes de clínica ni importar actividad. Mínimo 0,01 €, hasta dos decimales."
            error={
              touched.gross && !fields.gross_amount
                ? "Introduce un importe positivo con hasta dos decimales."
                : undefined
            }
            onValueChange={(value) => {
              setGross(value);
              setTouched((old) => ({ ...old, gross: false }));
            }}
            onBlur={() => setTouched((old) => ({ ...old, gross: true }))}
          />
          <dl
            className="space-y-4 rounded-xl bg-surface-container-low p-5"
            aria-live="polite"
          >
            {[
              ["Importe bruto", fields.gross_amount],
              ["Retención IRPF (15% fijo)", fields.withholding_amount],
              ["Total a cobrar", fields.net_amount],
            ].map(([label, value]) => (
              <div key={label} className="flex flex-wrap justify-between gap-2">
                <dt>{label}</dt>
                <dd className="font-semibold tabular-nums">{value || "—"}</dd>
              </div>
            ))}
          </dl>
          <p className="text-sm text-on-surface-variant">
            El IRPF de facturas es siempre del 15%, independiente del ajuste de
            actividad.
          </p>
          <Button disabled aria-describedby="invoice-unavailable">
            Descargar factura PDF
          </Button>
        </form>
      </Surface>
      <Surface
        as="section"
        variant="tonal"
        aria-labelledby="invoice-preview-title"
        className="lg:min-h-[620px]"
      >
        <div className="space-y-5">
          <h2
            id="invoice-preview-title"
            className="font-headline text-title font-semibold"
          >
            Vista previa del PDF
          </h2>
          <div className="flex min-h-64 flex-col justify-center gap-4 rounded-xl bg-surface-container p-6 sm:min-h-96 sm:p-10">
            <p className="font-headline text-title">
              Generación próximamente disponible
            </p>
            <p
              id="invoice-unavailable"
              className="leading-7 text-on-surface-variant"
            >
              Puedes preparar los datos y comprobar los importes. La asignación
              de plantillas, la vista previa y la descarga de facturas PDF
              todavía no están disponibles.
            </p>
            <p className="text-sm text-on-surface-variant">
              No se ha generado ningún documento.
            </p>
          </div>
        </div>
      </Surface>
    </div>
  );
}
