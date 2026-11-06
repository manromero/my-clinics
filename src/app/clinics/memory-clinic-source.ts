import {
  parseClinicPercentage,
  type Clinic,
  type ClinicSaveResult,
  type ClinicSource,
} from "./clinic-source";

export type ClinicFailure = "load-error" | "save-error";

export function createMemoryClinicSource(
  initialClinics: readonly Clinic[],
  { failure, delay = 500 }: { failure?: ClinicFailure; delay?: number } = {},
): ClinicSource {
  const clinics = new Map(
    initialClinics.map((clinic) => [clinic.id, { ...clinic }]),
  );
  let nextId = 0;
  let pendingFailure = failure;
  let loading: ReturnType<ClinicSource["list"]> | undefined;

  const wait = () => new Promise<void>((resolve) => setTimeout(resolve, delay));

  async function list(): ReturnType<ClinicSource["list"]> {
    await wait();
    if (pendingFailure === "load-error") {
      pendingFailure = undefined;
      return { status: "failed" };
    }
    return {
      status: "loaded",
      clinics: Array.from(clinics.values(), (clinic) => ({ ...clinic })),
    };
  }

  async function save(
    changes: Omit<Clinic, "id">,
    id?: string,
  ): Promise<ClinicSaveResult> {
    await wait();
    if (id !== undefined && !clinics.has(id)) return { status: "failed" };
    const name = changes.name.trim();
    if (!name) return { status: "invalid", field: "name" };
    if (parseClinicPercentage(String(changes.percentage)).status !== "valid") {
      return { status: "invalid", field: "percentage" };
    }
    const normalizedName = name.toLowerCase();
    if (
      Array.from(clinics.values()).some(
        (clinic) =>
          clinic.id !== id &&
          clinic.name.trim().toLowerCase() === normalizedName,
      )
    ) {
      return { status: "duplicate-name" };
    }
    if (pendingFailure === "save-error") {
      pendingFailure = undefined;
      return { status: "failed" };
    }

    if (id === undefined) {
      do {
        id = `preview-${++nextId}`;
      } while (clinics.has(id));
    }
    const clinic = { ...changes, id, name };
    clinics.set(id, clinic);
    return { status: "saved", clinic: { ...clinic } };
  }

  return {
    list() {
      // Share an in-flight load when React replays mount effects in development.
      return (loading ??= list().finally(() => {
        loading = undefined;
      }));
    },
    create: (details) => save({ ...details, active: true }),
    update: (id, changes) => save(changes, id),
  };
}
