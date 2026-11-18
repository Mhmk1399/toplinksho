import { after } from "next/server";
import { validateConsultation } from "@/lib/consultation";
import { createConsultation, findSubmission } from "@/lib/server/consultations";
import { rateLimit } from "@/lib/server/db";
import { privateJson, readJson, requestKey, sameOrigin } from "@/lib/server/http";
import { sendConsultationNotification } from "@/lib/server/mail";

export const runtime = "nodejs";
export const maxDuration = 30;

export async function POST(request: Request) {
  if (!sameOrigin(request)) return privateJson({ error: "درخواست معتبر نیست. صفحه را دوباره باز کنید." }, 403);
  const body = await readJson(request);
  if (!body || typeof body.submissionId !== "string" || !/^[\da-f]{8}-[\da-f]{4}-4[\da-f]{3}-[89ab][\da-f]{3}-[\da-f]{12}$/i.test(body.submissionId)) return privateJson({ error: "اطلاعات فرم معتبر نیست. لطفاً دوباره تلاش کنید." }, 400);
  if (body.company) return privateJson({ error: "امکان ثبت این درخواست وجود ندارد." }, 422);
  const { values, errors } = validateConsultation(body);
  if (Object.keys(errors).length) return privateJson({ error: "فیلدهای مشخص‌شده را بررسی کنید.", errors }, 422);
  try {
    const existing = await findSubmission(body.submissionId);
    if (existing) return privateJson({ reference: existing.reference }, 200);
    const limit = await rateLimit(requestKey(request, "consultation"), 15, 10 * 60 * 1000);
    if (!limit.allowed) return privateJson({ error: "تعداد درخواست‌ها زیاد است. چند دقیقهٔ دیگر تلاش کنید یا با ما تماس بگیرید." }, 429, { "Retry-After": String(limit.retryAfter) });
    const { request: lead, created } = await createConsultation(values, body.submissionId);
    if (created) after(() => sendConsultationNotification(lead.id));
    return privateJson({ reference: lead.reference }, created ? 201 : 200);
  } catch {
    return privateJson({ error: "ثبت درخواست انجام نشد. اطلاعات شما در فرم باقی مانده؛ دوباره تلاش کنید یا با ما تماس بگیرید." }, 503);
  }
}
