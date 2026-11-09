import { connection } from "next/server";
import { Alert } from "@/lib/components/alert/alert";
import { Badge } from "@/lib/components/badge/badge";
import { EmptyState } from "@/lib/components/empty-state/empty-state";
import { Surface } from "@/lib/components/surface/surface";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";
import { ClinicLoadError } from "./clinic-load-error";
import { listClinics } from "./list-clinics";

const percentageFormat = new Intl.NumberFormat("es-ES", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

function ClinicIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="size-5"
    >
      <rect x="4" y="4" width="16" height="16" rx="3" />
      <path d="M12 8v8m-4-4h8" />
    </svg>
  );
}

export async function SavedClinics() {
  await connection();
  const client = createSupabaseServerClient();
  const clinics = client ? await listClinics(client) : null;

  if (clinics === null) return <ClinicLoadError />;

  if (clinics.length === 0) {
    return (
      <EmptyState
        icon={<ClinicIcon />}
        title="Aún no hay clínicas"
        explanation="Las clínicas guardadas aparecerán aquí."
      />
    );
  }

  return (
    <section aria-labelledby="clinics-list" className="space-y-4">
      <h2 id="clinics-list" className="font-headline text-title">
        Todas las clínicas
      </h2>
      {clinics.every((clinic) => !clinic.active) && (
        <Alert title="Todas las clínicas están inactivas">
          No hay clínicas activas disponibles para registrar nueva actividad.
        </Alert>
      )}
      <ul className="space-y-3">
        {clinics.map((clinic) => (
          <li key={clinic.id}>
            <Surface
              variant={clinic.active ? "white" : "tonal"}
              className="sm:p-5!"
            >
              <div className="grid grid-cols-[auto_minmax(0,1fr)] items-start gap-x-4 sm:items-center">
                <span className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <ClinicIcon />
                </span>
                <div className="min-w-0 space-y-1">
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                    <h3 className="min-w-0 font-headline text-lg font-semibold wrap-anywhere">
                      {clinic.name}
                    </h3>
                    <Badge variant={clinic.active ? "active" : "inactive"} dot>
                      {clinic.active ? "Activa" : "Inactiva"}
                    </Badge>
                  </div>
                  <p className="font-label text-label text-on-surface-variant">
                    Porcentaje por defecto{" "}
                    <strong className="ml-1 whitespace-nowrap text-on-surface">
                      {percentageFormat.format(clinic.percentage)} %
                    </strong>
                  </p>
                </div>
              </div>
            </Surface>
          </li>
        ))}
      </ul>
    </section>
  );
}
