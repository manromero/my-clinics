import "server-only";
import postgres from "postgres";
import type {
  ClinicClient,
  ClinicRow,
} from "../_repositories/clinics/clinic-repository";

let sql: ReturnType<typeof postgres> | undefined;

export function createSupabaseClient(): ClinicClient {
  return {
    async listClinics() {
      const url = process.env.MYCLINICS_DATABASE_URL;
      if (!url) throw new Error("Database connection unavailable");
      sql ??= postgres(url, {
        ssl: "verify-full",
        prepare: false,
        max: 3,
        connect_timeout: 10,
        idle_timeout: 20,
      });
      return sql<
        ClinicRow[]
      >`select id::text as id, name, percentage::float8 as percentage, active from public.clinics order by id`;
    },
  };
}
