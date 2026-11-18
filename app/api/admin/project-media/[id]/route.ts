import { getAdminSession } from "@/lib/server/auth";
import { serveProjectAsset, removeUnusedAsset } from "@/lib/server/project-media";
import { projectAdmin, projectFailure } from "@/lib/server/project-api";
import { privateJson } from "@/lib/server/http";
export const runtime = "nodejs";
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!await getAdminSession()) return privateJson({ error: "ابتدا وارد مدیریت شوید." }, 401);
  return serveProjectAsset(request, (await params).id, true);
}
export const HEAD = GET;
export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try { await projectAdmin(request); await removeUnusedAsset((await params).id); return privateJson({ ok: true }); }
  catch (error) { return projectFailure(error); }
}
