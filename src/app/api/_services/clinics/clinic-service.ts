import "server-only";
import { createClinicService } from "@/lib/clinics/clinic-service";
import { createSupabaseClinicRepository } from "../../_repositories/clinics/clinic-repository";
import { createSupabaseClient } from "../../_supabase/client";

export function persistentClinicService() {
  return createClinicService(
    createSupabaseClinicRepository(createSupabaseClient()),
  );
}
