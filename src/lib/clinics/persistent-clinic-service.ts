import "server-only";
import { createClinicService } from "./clinic-service";
import { createSupabaseClient } from "../supabase/client";
import { createSupabaseClinicRepository } from "../supabase/clinic-repository";

export function persistentClinicService() {
  return createClinicService(
    createSupabaseClinicRepository(createSupabaseClient()),
  );
}
