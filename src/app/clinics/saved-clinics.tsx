import { connection } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";
import { ClinicList } from "./clinic-list";
import { listClinics } from "./list-clinics";

export async function SavedClinics() {
  await connection();
  const client = createSupabaseServerClient();
  const clinics = client ? await listClinics(client) : null;

  return <ClinicList clinics={clinics} />;
}
