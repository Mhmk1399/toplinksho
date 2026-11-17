import { privateJson, readJson } from "@/lib/server/http";
import { projectAdmin, projectFailure } from "@/lib/server/project-api";
import { deleteProject, saveProject } from "@/lib/server/projects";
import { ProjectError } from "@/lib/server/project-errors";
import { adminProject } from "@/lib/server/projects";
import { getAdminSession } from "@/lib/server/auth";
export const runtime = "nodejs";
export const maxDuration = 60;
export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    if (!await getAdminSession()) throw new ProjectError("ابتدا وارد مدیریت شوید.", 401);
    const project = await adminProject((await params).id);
    if (!project) throw new ProjectError("پروژه پیدا نشد.", 404);
    return privateJson({ project });
  } catch (error) { return projectFailure(error); }
}
export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const admin = await projectAdmin(request), body = await readJson(request, 6000000);
    if (!body) throw new ProjectError("اطلاعات پروژه معتبر نیست.");
    return privateJson({ project: await saveProject((await params).id, body, admin.id) });
  } catch (error) { return projectFailure(error); }
}
export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await projectAdmin(request);
    const body = await readJson(request, 1000);
    if (!body) throw new ProjectError("اطلاعات حذف معتبر نیست.");
    await deleteProject((await params).id, body);
    return privateJson({ ok: true });
  } catch (error) { return projectFailure(error); }
}
