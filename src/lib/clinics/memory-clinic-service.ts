import { createClinicService } from "./clinic-service";
import { createMemoryClinicRepository } from "./memory-clinic-repository";
import type { ClinicSource } from "./clinic";

export type { ClinicFailure } from "./memory-clinic-repository";

export function createMemoryClinicSource(
  ...args: Parameters<typeof createMemoryClinicRepository>
): ClinicSource & Required<Pick<ClinicSource, "deletion">> {
  return createClinicService(
    createMemoryClinicRepository(...args),
  ) as ClinicSource & Required<Pick<ClinicSource, "deletion">>;
}
