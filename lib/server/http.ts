import "server-only";
import { createHash } from "node:crypto";

export function sameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  try { return !!origin && origin === new URL(process.env.APP_URL || request.url).origin; } catch { return false; }
}

export function privateJson(body: unknown, status = 200, headers: Record<string, string> = {}) {
  return Response.json(body, { status, headers: { "Cache-Control": "no-store", ...headers } });
}

export function requestKey(request: Request, scope: string) {
  // Keep only a one-way key, never raw IP addresses, in the rate-limit table.
  const forwarded = process.env.TRUST_PROXY === "true" ? request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() : undefined;
  return createHash("sha256").update(`${scope}:${forwarded || "shared"}:${process.env.ADMIN_PASSWORD_HASH || "public"}`).digest("hex");
}

export async function readJson(request: Request, limit = 16000): Promise<Record<string, unknown> | null> {
  if (!request.headers.get("content-type")?.startsWith("application/json")) return null;
  if (Number(request.headers.get("content-length") || 0) > limit || !request.body) return null;
  const reader = request.body.getReader();
  let size = 0;
  const chunks: Uint8Array[] = [];
  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      size += value.length;
      if (size > limit) { await reader.cancel(); return null; }
      chunks.push(value);
    }
    const value = JSON.parse(Buffer.concat(chunks).toString("utf8"));
    return value && typeof value === "object" && !Array.isArray(value) ? value : null;
  } catch { return null; }
}
