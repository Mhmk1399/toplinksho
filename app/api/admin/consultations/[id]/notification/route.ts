import { after } from "next/server";
import { getAdminSession } from "@/lib/server/auth";
import { getConsultation } from "@/lib/server/consultations";
import { privateJson, sameOrigin } from "@/lib/server/http";
import { sendConsultationNotification } from "@/lib/server/mail";

export const maxDuration = 30;

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  if (!sameOrigin(request)) return privateJson({ error: "درخواست معتبر نیست." }, 403);
  if (!await getAdminSession()) return privateJson({ error: "نشست شما پایان یافته است. دوباره وارد شوید." }, 401);
  const { id } = await context.params;
  const lead = await getConsultation(id);
  if (!lead) return privateJson({ error: "درخواست پیدا نشد." }, 404);
  if (["sent", "sending"].includes(lead.email_status)) return privateJson({ error: "این اعلان قبلاً ارسال شده یا در حال ارسال است." }, 409);
  after(() => sendConsultationNotification(id));
  return privateJson({ ok: true });
}
