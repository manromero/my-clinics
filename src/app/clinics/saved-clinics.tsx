import { ClinicList } from "./clinic-list";
import { listClinics } from "./list-clinics";

export async function SavedClinics() {
  return <ClinicList clinics={await listClinics()} />;
}
