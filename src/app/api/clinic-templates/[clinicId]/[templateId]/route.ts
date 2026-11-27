import { readSupabaseSession } from "@/lib/supabase/session";
import { createTemplateServer } from "@/lib/templates/server";
import { TemplateError } from "@/lib/templates/infrastructure";
import { isClinicId } from "@/lib/clinics/clinic";

export const runtime = "nodejs";

export async function GET(
  _request: Request,
  context: { params: Promise<{ clinicId: string; templateId: string }> },
) {
  const headers = { "Cache-Control": "private, no-store" };
  const { clinicId, templateId } = await context.params;
  if (
    !isClinicId(clinicId) ||
    !/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/.test(
      templateId,
    )
  )
    return new Response(null, { status: 404, headers });
  const session = await readSupabaseSession();
  if (!session) return new Response(null, { status: 401, headers });
  const templates = createTemplateServer(session.client);
  if (!templates) return new Response(null, { status: 503, headers });
  try {
    return await templates.read(clinicId, templateId);
  } catch (error) {
    const status =
      error instanceof TemplateError && error.code === "42501"
        ? 404
        : error instanceof TemplateError && error.code === "unauthenticated"
          ? 401
          : 503;
    return new Response(null, { status, headers });
  }
}
