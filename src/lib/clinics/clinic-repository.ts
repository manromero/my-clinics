import type { ClinicSource } from "./clinic";

// Technology-independent storage outcomes; optional writes are preview-only.
export type ClinicRepository = Pick<ClinicSource, "list" | "deletion"> &
  Partial<Pick<ClinicSource, "create" | "update">>;
