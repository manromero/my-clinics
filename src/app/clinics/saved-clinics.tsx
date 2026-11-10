import { connection } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";
import { ClinicList } from "./clinic-list";
import { ClinicLoadError } from "./clinic-load-error";
import { listClinics } from "./list-clinics";

export async function SavedClinics() {
  await connection();
  const client = createSupabaseServerClient();
  const clinics = client ? await listClinics(client) : null;

  if (clinics === null) return <ClinicLoadError />;
  return <ClinicList clinics={clinics} />;
}
