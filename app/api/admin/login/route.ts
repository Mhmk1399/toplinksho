import { cookies } from "next/headers";
import { adminConfigured, createSession, sessionCookie, sessionOptions, verifyCredentials } from "@/lib/server/auth";
import { rateLimit } from "@/lib/server/db";
import { privateJson, readJson, requestKey, sameOrigin } from "@/lib/server/http";

export const runtime = "nodejs";

export async function POST(request: Request) {
  if (!sameOrigin(request)) return privateJson({ error: "درخواست معتبر نیست." }, 403);
  const body = await readJson(request, 4000);
  if (!body || typeof body.email !== "string" || typeof body.password !== "string" || body.email.length > 254 || body.password.length > 256) return privateJson({ error: "ایمیل و رمز عبور را بررسی کنید." }, 400);
  if (!adminConfigured()) return privateJson({ error: "ورود مدیریت هنوز تنظیم نشده است. راهنمای راه‌اندازی را بررسی کنید." }, 503);
  try {
    const limit = await rateLimit(requestKey(request, "login"), 6, 15 * 60 * 1000);
    if (!limit.allowed) return privateJson({ error: "تلاش‌های ورود زیاد است. چند دقیقهٔ دیگر دوباره امتحان کنید." }, 429, { "Retry-After": String(limit.retryAfter) });
    const admin = await verifyCredentials(body.email, body.password);
    if (!admin) return privateJson({ error: "ایمیل یا رمز عبور درست نیست." }, 401);
    (await cookies()).set(sessionCookie, await createSession(admin), sessionOptions);
    return privateJson({ ok: true });
  } catch { return privateJson({ error: "ورود هم‌اکنون ممکن نیست. دوباره تلاش کنید." }, 503); }
}
