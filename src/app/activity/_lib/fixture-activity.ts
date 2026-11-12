import {
  type ActivityClinicOption,
  type ActivityPreview,
  type ActivityQuery,
  type ActivityRow,
} from "./activity-view";

const clinics: readonly ActivityClinicOption[] = [
  {
    id: "gran-via",
    name: "Gran Vía",
    active: true,
    percentageBasisPoints: 3500,
  },
  {
    id: "dental-norte",
    name: "Dental Norte",
    active: true,
    percentageBasisPoints: 3250,
  },
  {
    id: "san-jeronimo",
    name: "Dental San Jerónimo",
    active: false,
    percentageBasisPoints: 2800,
  },
  {
    id: "clinica-centro",
    name: "Clínica Centro",
    active: false,
    percentageBasisPoints: 3000,
  },
];

export const fixtureRows: readonly ActivityRow[] = [
  {
    id: "revision-octubre",
    date: "2026-10-15",
    clinicId: "san-jeronimo",
    description: "Revisión periodontal",
    calculationMode: "percentage",
    appliedPercentageBasisPoints: 2500,
    appliedIrpfBasisPoints: 1500,
    priceCents: "11000",
    grossCents: "2750",
    netCents: "2338",
  },
  {
    id: "endodoncia-octubre",
    date: "2026-10-28",
    clinicId: "gran-via",
    description: "Endodoncia molar",
    calculationMode: "percentage",
    appliedPercentageBasisPoints: 3000,
    appliedIrpfBasisPoints: 1500,
    priceCents: "24000",
    grossCents: "7200",
    netCents: "6120",
  },
  {
    id: "control-octubre",
    date: "2026-10-28",
    clinicId: "gran-via",
    description: null,
    calculationMode: "percentage",
    appliedPercentageBasisPoints: 3000,
    appliedIrpfBasisPoints: 1500,
    priceCents: "0",
    grossCents: "0",
    netCents: "0",
  },
  {
    id: "laboratorio-octubre",
    date: "2026-10-25",
    clinicId: "gran-via",
    description: "Repetición de corona de laboratorio",
    calculationMode: "direct",
    appliedPercentageBasisPoints: 3000,
    appliedIrpfBasisPoints: 1500,
    priceCents: "-15000",
    grossCents: "-1000",
    netCents: "-850",
  },
  {
    id: "ajuste-octubre",
    date: "2026-10-23",
    clinicId: "dental-norte",
    description: "Ajuste de honorarios",
    calculationMode: "direct",
    appliedPercentageBasisPoints: 3250,
    appliedIrpfBasisPoints: 1500,
    priceCents: "0",
    grossCents: "-2750",
    netCents: "-2338",
  },
  {
    id: "guardia-octubre",
    date: "2026-10-22",
    clinicId: "dental-norte",
    description: "Guardia y revisión posquirúrgica",
    calculationMode: "direct",
    appliedPercentageBasisPoints: 3250,
    appliedIrpfBasisPoints: 1250,
    priceCents: "30000",
    grossCents: "18000",
    netCents: "15750",
  },
  {
    id: "limpieza-noviembre",
    date: "2026-11-03",
    clinicId: "dental-norte",
    description: "Limpieza dental",
    calculationMode: "percentage",
    appliedPercentageBasisPoints: 3250,
    appliedIrpfBasisPoints: 1500,
    priceCents: "8000",
    grossCents: "2600",
    netCents: "2210",
  },
  {
    id: "laboratorio-noviembre",
    date: "2026-11-02",
    clinicId: "dental-norte",
    description: "Ajuste de prótesis",
    calculationMode: "percentage",
    appliedPercentageBasisPoints: 3250,
    appliedIrpfBasisPoints: 1500,
    priceCents: "-5000",
    grossCents: "-1625",
    netCents: "-1381",
  },
];

export function activityPreviewFromQuery(
  value: ActivityQuery["preview"],
): ActivityPreview | undefined {
  if (
    value === "inactive" ||
    value === "loading" ||
    value === "error" ||
    value === "write-error"
  ) {
    return value;
  }
}

export function fixtureClinics(preview?: ActivityPreview) {
  return preview === "inactive"
    ? clinics.map((clinic) => ({ ...clinic, active: false }))
    : clinics;
}
