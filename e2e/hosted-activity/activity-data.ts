import { randomInt, randomUUID } from "node:crypto";
import { account, type ProjectName } from "./config";
import type { OwnerClient } from "./session";

export function createScope(project: ProjectName) {
  // Use a synthetic period far from ordinary dates and a separate marker per test.
  const year = String(randomInt(4000, 9000));
  const month = String(randomInt(1, 13)).padStart(2, "0");
  const nextYear = month === "12" ? String(Number(year) + 1) : year;
  const nextMonth =
    month === "12" ? "01" : String(Number(month) + 1).padStart(2, "0");
  const clinic = account(project).clinicId;
  return {
    clinic,
    monthStart: `${year}-${month}-01`,
    monthEnd: `${nextYear}-${nextMonth}-01`,
    date: `${year}-${month}-15`,
    displayDate: `15/${month}/${year}`,
    marker: `Activity acceptance ${project} ${randomUUID()}`,
    path: `/activity?${new URLSearchParams({ year, month, clinic })}`,
  };
}

export type ActivityScope = ReturnType<typeof createScope>;

export async function verifyEmptyPeriod(
  client: OwnerClient,
  scope: ActivityScope,
) {
  const { data, error } = await client
    .from("activity")
    .select("id")
    .filter("clinic_id", "eq", scope.clinic)
    .gte("activity_date", scope.monthStart)
    .lt("activity_date", scope.monthEnd)
    .limit(1);
  if (error || data?.length !== 0) {
    throw new Error("Could not verify an empty fixture period before saving.");
  }
}

async function findCreatedRows(client: OwnerClient, scope: ActivityScope) {
  const { data, error } = await client
    .from("activity")
    .select("activity_key:id::text")
    .filter("clinic_id", "eq", scope.clinic)
    .eq("activity_date", scope.date)
    .eq("description", scope.marker);
  if (
    error ||
    !data ||
    data.some(({ activity_key }) => !/^[1-9]\d*$/.test(activity_key))
  ) {
    throw new Error(
      "Cleanup could not safely identify the run's saved activity.",
    );
  }
  return data;
}

export async function removeCreatedRows(
  client: OwnerClient,
  scope: ActivityScope,
) {
  const rows = await findCreatedRows(client, scope);
  for (const { activity_key: id } of rows) {
    const { data, error } = await client.rpc("delete_activity", { p_id: id });
    if (error || data !== id)
      throw new Error("Owner-scoped activity cleanup failed.");
  }
  if ((await findCreatedRows(client, scope)).length !== 0) {
    throw new Error("Run-owned activity remained after cleanup.");
  }
  return rows.length;
}
