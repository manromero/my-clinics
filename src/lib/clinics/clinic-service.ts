import {
  parseClinicPercentage,
  type Clinic,
  type ClinicSaveResult,
  type ClinicSource,
} from "./clinic";
import type { ClinicRepository } from "./clinic-repository";

export function createClinicService(
  repository: ClinicRepository,
): ClinicSource {
  // Serialize preview mutations so concurrent duplicate names cannot both save.
  let mutation = Promise.resolve();
  function save(
    changes: Omit<Clinic, "id">,
    id?: string,
  ): Promise<ClinicSaveResult> {
    const run = mutation
      .then(async (): Promise<ClinicSaveResult> => {
        const name = changes.name.trim();
        if (!name) return { status: "invalid", field: "name" };
        if (
          parseClinicPercentage(String(changes.percentage)).status !== "valid"
        )
          return { status: "invalid", field: "percentage" };
        if (!repository.create || !repository.update)
          return { status: "failed" };
        const current = await repository.list();
        if (current.status !== "loaded") return { status: "failed" };
        if (
          id !== undefined &&
          !current.clinics.some((clinic) => clinic.id === id)
        )
          return { status: "failed" };
        if (
          current.clinics.some(
            (clinic) =>
              clinic.id !== id &&
              clinic.name.trim().toLowerCase() === name.toLowerCase(),
          )
        )
          return { status: "duplicate-name" };
        return id === undefined
          ? repository.create({ name, percentage: changes.percentage })
          : repository.update(id, { ...changes, name });
      })
      .catch((): ClinicSaveResult => ({ status: "failed" }));
    mutation = run.then(() => undefined);
    return run;
  }
  return {
    async list() {
      try {
        return await repository.list();
      } catch {
        return { status: "failed" };
      }
    },
    create: (details) => save({ ...details, active: true }),
    update: (id, changes) => save(changes, id),
    deletion: repository.deletion && {
      hasLinkedActivity: (id) => repository.deletion!.hasLinkedActivity(id),
      async remove(id) {
        try {
          return await repository.deletion!.remove(id);
        } catch {
          return { status: "failed" };
        }
      },
    },
  };
}
