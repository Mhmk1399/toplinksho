import { cookies } from "next/headers";
import { revokeSession, sessionCookie, sessionOptions } from "@/lib/server/auth";
import { privateJson, sameOrigin } from "@/lib/server/http";

export async function POST(request: Request) {
  if (!sameOrigin(request)) return privateJson({ error: "درخواست معتبر نیست." }, 403);
  const store = await cookies();
  const token = store.get(sessionCookie)?.value;
  if (token) await revokeSession(token);
  store.set(sessionCookie, "", { ...sessionOptions, maxAge: 0 });
  return privateJson({ ok: true });
}
