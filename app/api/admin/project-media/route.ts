import { privateJson } from "@/lib/server/http";
import { projectAdmin, projectFailure } from "@/lib/server/project-api";
import { uploadProjectAsset } from "@/lib/server/project-media";
import { projectIdPattern } from "@/lib/projects";
import { ProjectError } from "@/lib/server/project-errors";
import { rateLimit } from "@/lib/server/db";
export const runtime = "nodejs";
export const maxDuration = 300;
export async function POST(request: Request) {
  try {
    const admin = await projectAdmin(request), id = request.headers.get("x-project-id") || "";
    if (!projectIdPattern.test(id)) throw new ProjectError("شناسهٔ پروژه معتبر نیست.");
    if (!(await rateLimit(`project-upload:${admin.id}`, 60, 3600000)).allowed) throw new ProjectError("تعداد بارگذاری‌ها زیاد است؛ کمی بعد دوباره تلاش کنید.", 429);
    return privateJson({ asset: await uploadProjectAsset(request, id, admin.id) }, 201);
  } catch (error) { return projectFailure(error); }
}
