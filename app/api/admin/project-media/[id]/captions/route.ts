import { getAdminSession } from "@/lib/server/auth";
import { serveProjectCaptions } from "@/lib/server/project-media";
import { privateJson } from "@/lib/server/http";
export const runtime = "nodejs";
export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!await getAdminSession()) return privateJson({ error: "ابتدا وارد مدیریت شوید." }, 401);
  return serveProjectCaptions((await params).id, true);
}
