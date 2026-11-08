import { persistentClinicService } from "@/lib/clinics/persistent-clinic-service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const result = await persistentClinicService().list();
  return Response.json(result, {
    status: result.status === "loaded" ? 200 : 503,
    headers: { "Cache-Control": "no-store" },
  });
}
