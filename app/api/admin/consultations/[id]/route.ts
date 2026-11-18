import { getAdminSession } from "@/lib/server/auth";
import { getConsultation, updateConsultation } from "@/lib/server/consultations";
import { isRequestStatus } from "@/lib/consultation";
import { privateJson, readJson, sameOrigin } from "@/lib/server/http";

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  if (!sameOrigin(request)) return privateJson({ error: "درخواست معتبر نیست." }, 403);
  if (!await getAdminSession()) return privateJson({ error: "نشست شما پایان یافته است. دوباره وارد شوید." }, 401);
  const { id } = await context.params;
  const body = await readJson(request);
  if (!body || !isRequestStatus(body.status) || typeof body.notes !== "string" || body.notes.length > 5000 || !Number.isSafeInteger(body.version) || Number(body.version) < 1) return privateJson({ error: "اطلاعات تغییرات معتبر نیست." }, 422);
  if (!await getConsultation(id)) return privateJson({ error: "درخواست پیدا نشد." }, 404);
  const updated = await updateConsultation(id, body.status, body.notes.trim(), Number(body.version));
  if (!updated) return privateJson({ error: "این درخواست در جای دیگری تغییر کرده است. یادداشتتان را نگه دارید و صفحه را دوباره باز کنید." }, 409);
  return privateJson({ ok: true, version: updated.version });
}
