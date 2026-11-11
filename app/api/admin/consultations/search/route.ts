import { getAdminSession } from "@/lib/server/auth";
import { listConsultations } from "@/lib/server/consultations";
import { isRequestStatus, normalizeDigits } from "@/lib/consultation";
import { privateJson, readJson, sameOrigin } from "@/lib/server/http";

export async function POST(request: Request) {
  if (!sameOrigin(request)) return privateJson({ error: "درخواست معتبر نیست." }, 403);
  if (!await getAdminSession()) return privateJson({ error: "نشست شما پایان یافته است. دوباره وارد شوید." }, 401);
  const body = await readJson(request, 3000);
  if (!body || typeof body.query !== "string" || body.query.length > 100 || (body.status !== "" && !isRequestStatus(body.status)) || !Number.isSafeInteger(body.page) || Number(body.page) < 1) return privateJson({ error: "فیلترهای جست‌وجو معتبر نیست." }, 422);
  return privateJson(await listConsultations({ query: normalizeDigits(body.query.trim()), status: body.status as string, page: Number(body.page) }));
}
