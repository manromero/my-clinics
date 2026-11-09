"use client";

import { createBrowserClinicSource } from "@/lib/clinics/browser-clinic-source";
import { ClinicsPreview } from "./clinics-preview";

const browserClinicSource = createBrowserClinicSource();

export function PersistentClinics() {
  return (
    <ClinicsPreview
      initialClinics={[]}
      persistentSource={browserClinicSource}
    />
  );
}
