import type { Metadata } from "next";
import { AppFooter } from "@/lib/components/app-footer/app-footer";
import { AppHeader } from "@/lib/components/app-header/app-header";
import { ClinicsPreview, type SampleClinic } from "./clinics-preview";

export const metadata: Metadata = {
  title: "Clínicas | MyClinics",
};

const sampleClinics: readonly SampleClinic[] = [
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

  return (
    <div className="flex min-h-dvh flex-col">
      <AppHeader variant="public" />
      <ClinicsPreview clinics={preview === "empty" ? [] : sampleClinics} />
      <AppFooter
        identity="MyClinics"
        metadata="Vista previa con datos de ejemplo"
      />
    </div>
  );
}
