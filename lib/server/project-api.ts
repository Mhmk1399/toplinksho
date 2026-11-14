import "server-only";
import { getAdminSession } from "@/lib/server/auth";
import { privateJson, sameOrigin } from "@/lib/server/http";
import { ProjectError } from "@/lib/server/project-errors";
export async function projectAdmin(request: Request) {
  if (!sameOrigin(request)) throw new ProjectError("درخواست معتبر نیست.", 403);
  const admin = await getAdminSession();
  if (!admin) throw new ProjectError("نشست شما پایان یافته است. دوباره وارد شوید؛ تغییرات فرم را نگه دارید.", 401);
  return admin;
}
export function projectFailure(error: unknown) {
  if (error instanceof ProjectError) return privateJson({ error: error.message, fields: error.fields }, error.status);
  return privateJson({ error: "ارتباط با سرور برقرار نشد. اطلاعات را نگه دارید و دوباره تلاش کنید." }, 503);
}
