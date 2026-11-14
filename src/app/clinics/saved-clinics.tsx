import { ClinicList } from "./clinic-list";
import { listClinics } from "./list-clinics";

export async function SavedClinics({ ownerId }: { ownerId: string }) {
  return <ClinicList clinics={await listClinics()} ownerId={ownerId} />;
}
