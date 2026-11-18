import { privateJson, readJson } from "@/lib/server/http";
import { projectAdmin, projectFailure } from "@/lib/server/project-api";
import { saveProject } from "@/lib/server/projects";
import { ProjectError } from "@/lib/server/project-errors";
export async function POST(request: Request) {
  try {
    const admin = await projectAdmin(request), body = await readJson(request, 6000000);
    if (!body || typeof body.id !== "string") throw new ProjectError("اطلاعات پروژه معتبر نیست.");
    const project = await saveProject(body.id, body, admin.id, true);
    return privateJson({ project }, 201);
  } catch (error) { return projectFailure(error); }
}
