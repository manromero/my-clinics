import type { Metadata } from "next";
import { AppFooter } from "@/lib/components/app-footer/app-footer";
import { AppHeader } from "@/lib/components/app-header/app-header";
import { ClinicsPreview } from "./clinics-preview";
import type { Clinic } from "./clinic-source";

export const metadata: Metadata = {
  title: "Clínicas | MyClinics",
};

const sampleClinics: readonly Clinic[] = [
  {
    id: "alameda",
    name: "Clínica Dental Alameda",
    percentage: 30,
    active: true,
  },
  {
    id: "mirador",
    name: "Centro Odontológico Mirador",
    percentage: 27.5,
    active: true,
  },
  { id: "olivos", name: "Dental Los Olivos", percentage: 20, active: false },
];

export default async function ClinicsPage({
  searchParams,
}: PageProps<"/clinics">) {
  const { preview } = await searchParams;
  const scenario = typeof preview === "string" ? preview : undefined;
  const isPreview = [
    "default",
    "empty",
    "all-inactive",
    "load-error",
    "save-error",
    "delete-error",
  ].includes(scenario ?? "");
  const initialClinics =
    scenario === "empty"
      ? []
      : scenario === "all-inactive"
        ? sampleClinics.map((clinic) => ({ ...clinic, active: false }))
        : sampleClinics;
  const failure =
    scenario === "load-error" ||
    scenario === "save-error" ||
    scenario === "delete-error"
      ? scenario
      : undefined;

  return (
    <div className="flex min-h-dvh flex-col">
      <AppHeader variant="public" />
      <ClinicsPreview
        key={isPreview ? scenario : "persistent"}
        persistent={!isPreview}
        initialClinics={initialClinics}
        linkedClinicIds={["alameda"]}
        failure={failure}
      />
      <AppFooter
        identity="MyClinics"
        metadata={
          isPreview
            ? "Vista previa en memoria con datos de ejemplo"
            : "Entorno de desarrollo � Datos sint�ticos"
        }
      />
    </div>
  );
}
