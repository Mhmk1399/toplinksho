import { getAdminSession } from "@/lib/server/auth";
import { privateJson, requestKey, sameOrigin } from "@/lib/server/http";
import { mailConfigured, verifyMail } from "@/lib/server/mail";
import { rateLimit } from "@/lib/server/db";

export async function POST(request: Request) {
  if (!sameOrigin(request)) return privateJson({ error: "درخواست معتبر نیست." }, 403);
  if (!await getAdminSession()) return privateJson({ error: "ابتدا وارد مدیریت شوید." }, 401);
  if (!(await rateLimit(requestKey(request, "mail-check"), 5, 60000)).allowed) return privateJson({ error: "یک دقیقه دیگر دوباره بررسی کنید." }, 429);
  if (!mailConfigured()) return privateJson({ error: "تنظیمات سرویس ایمیل هنوز کامل نیست." }, 503);
  try { await verifyMail(); return privateJson({ ok: true }); }
  catch { return privateJson({ error: "اتصال ایمیل برقرار نشد. میزبان، پورت و اطلاعات ورود را بررسی کنید." }, 503); }
}
