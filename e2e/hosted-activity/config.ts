import { assertApprovedTarget } from "./target.mjs";

export const projectNames = ["desktop", "mobile"] as const;
export type ProjectName = (typeof projectNames)[number];
export const appOrigin = "http://127.0.0.1:3205";
export const artifactDir = "hosted-activity-results/artifacts";

function required(name: string) {
  const value = process.env[name];
  if (!value) throw new Error(`Missing hosted acceptance setting ${name}.`);
  return value;
}

export function account(project: ProjectName) {
  const prefix = `ACTIVITY_${project.toUpperCase()}`;
  const displayName = `Activity Acceptance ${project === "desktop" ? "Desktop" : "Mobile"}`;
  const id = required(`${prefix}_USER_ID`);
  const clinicId = required(`${prefix}_CLINIC_ID`);
  if (!/^[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12}$/.test(id)) {
    throw new Error(`Invalid ${project} user ID setting.`);
  }
  if (!/^[1-9]\d*$/.test(clinicId)) {
    throw new Error(`Invalid ${project} clinic ID setting.`);
  }
  return {
    id,
    email: required(`${prefix}_EMAIL`),
    password: required(`${prefix}_PASSWORD`),
    displayName,
    clinicId,
    clinicName: `${displayName} Clinic`,
  };
}

export function hostedTarget() {
  const url = required("NEXT_PUBLIC_SUPABASE_URL");
  assertApprovedTarget(url);
  const key = required("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY");
  if (!key.startsWith("sb_publishable_")) {
    throw new Error("Hosted acceptance requires a Supabase publishable key.");
  }
  return { url, key };
}

export function verifyConfiguration() {
  hostedTarget();
  const desktop = account("desktop");
  const mobile = account("mobile");
  if (
    desktop.id === mobile.id ||
    desktop.email.toLowerCase() === mobile.email.toLowerCase() ||
    desktop.clinicId === mobile.clinicId
  ) {
    throw new Error(
      "The desktop and mobile fixture accounts and clinics must be distinct.",
    );
  }
}
