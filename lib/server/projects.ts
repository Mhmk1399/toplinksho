import "server-only";
import { cache } from "react";
import { revalidatePath } from "next/cache";
import connect from "@/lib/server/db";
import Project from "@/models/Project";
import { servicePages } from "@/lib/page-registry";
import { emptyProject, validateProject, projectIdPattern, type ProjectDTO, type ProjectInput, type ProjectStatus } from "@/lib/projects";
import { assetList, validateProjectAssets } from "@/lib/server/project-media";
import { ProjectError } from "@/lib/server/project-errors";
import { acquireProjectLease, releaseProjectLease } from "@/lib/server/project-lock";

export { ProjectError } from "@/lib/server/project-errors";
export const projectServices = servicePages.filter(page => page.path !== "/services").map(page => ({ path: page.path, title: page.title, group: page.group || "growth", parent: page.parent || "/services" }));
function dto(row: Record<string, unknown>): ProjectDTO {
  const fields = Object.fromEntries(Object.keys(emptyProject()).map(key => [key, row[key]]));
  return JSON.parse(JSON.stringify({ ...fields, id: row.publicId, version: row.version, createdAt: row.createdAt, updatedAt: row.updatedAt, publishedAt: row.publishedAt || null })) as ProjectDTO;
}
export async function adminProject(id: string) {
  if (!projectIdPattern.test(id)) return null;
  await connect(); const row = await Project.findOne({ publicId: id }).lean();
  return row ? dto(row) : null;
}
export const publishedProject = cache(async (slug: string) => {
  if (!process.env.MONGODB_URI) return null;
  await connect(); const row = await Project.findOne({ slug, status: "published" }).lean();
  if (!row) return null;
  const project = dto(row);
  const ids = new Set([project.coverId, ...project.media.flatMap(item => [item.id, item.posterId])]);
  return { ...project, assets: (await assetList(row.publicId)).filter(asset => ids.has(asset.id)) };
});
export async function listProjects({ status, service, query = "", page = 1, limit = 12, admin = false }: { status?: ProjectStatus; service?: string; query?: string; page?: number; limit?: number; admin?: boolean } = {}) {
  if (!process.env.MONGODB_URI) return { items: [] as ProjectDTO[], total: 0, page: 1, pages: 1 };
  await connect();
  const where: Record<string, unknown> = admin ? (status ? { status } : {}) : { status: "published" };
  if (service && projectServices.some(item => item.path === service)) {
    where.services = { $in: [service, ...projectServices.filter(item => item.path.startsWith(service + "/")).map(item => item.path)] };
  }
  if (query.trim()) where.title = { $regex: query.trim().slice(0, 100).replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), $options: "i" };
  const size = Math.max(1, Math.min(24, Math.floor(limit) || 12));
  const total = await Project.countDocuments(where), pages = Math.max(1, Math.ceil(total / size));
  const current = Math.max(1, Math.min(pages, Math.floor(page) || 1));
  const rows = await Project.find(where).sort({ featured: -1, sortOrder: 1, publishedAt: -1, createdAt: -1, publicId: 1 }).skip((current - 1) * size).limit(size).lean();
  return { items: rows.map(dto), total, page: current, pages };
}
export async function saveProject(id: string, body: Record<string, unknown>, userId: string, creating = false) {
  if (!projectIdPattern.test(id)) throw new ProjectError("شناسهٔ پروژه معتبر نیست.");
  const { data, errors } = validateProject(body, projectServices.map(item => item.path));
  if (Object.keys(errors).length) throw new ProjectError("فیلدهای مشخص‌شده را بررسی کنید.", 422, errors);
  await connect(); await Project.init();
  const existing = await adminProject(id);
  if (creating && existing) return existing; // Stable client ID makes a retried creation idempotent.
  if (!creating && !existing) throw new ProjectError("پروژه پیدا نشد.", 404);
  if (existing && (!Number.isInteger(body.version) || body.version !== existing.version)) throw new ProjectError("نسخهٔ جدیدتری در سرور وجود دارد. تغییرات شما حفظ شده؛ پیش از ذخیره، آخرین نسخه را بررسی کنید.", 409);
  if (existing?.publishedAt && data.slug !== existing.slug) throw new ProjectError("نشانی پروژه پس از اولین انتشار ثابت می‌ماند.", 422, { slug: "نشانی منتشرشده قابل تغییر نیست." });
  const now = new Date();
  const values = { ...data, updatedBy: userId, publishedAt: existing?.publishedAt ? new Date(existing.publishedAt) : data.status === "published" ? now : null };
  const lease = existing ? await acquireProjectLease(id) : null;
  try {
    await validateProjectAssets(id, data);
    const row = creating
      ? await new Project({ ...values, publicId: id, createdBy: userId }).save()
      : await Project.findOneAndUpdate({ publicId: id, version: Number(body.version) }, { $set: values, $inc: { version: 1 } }, { returnDocument: "after", runValidators: true });
    if (!row) throw new ProjectError("این پروژه هم‌زمان تغییر کرده است. نسخهٔ تازه را بررسی کنید.", 409);
    refreshProjectPages(data, existing);
    return dto(row.toObject());
  } catch (error) {
    if (creating && (error as { code?: number }).code === 11000) {
      const saved = await adminProject(id);
      if (saved) return saved;
    }
    if ((error as { code?: number }).code === 11000) throw new ProjectError("این نشانی برای پروژهٔ دیگری ثبت شده است.", 409, { slug: "نشانی دیگری انتخاب کنید." });
    throw error;
  } finally { if (lease) await releaseProjectLease(id, lease); }
}
function refreshProjectPages(project: ProjectInput, previous: ProjectDTO | null) {
  revalidatePath("/portfolio"); revalidatePath("/portfolio/[slug]", "page"); revalidatePath("/sitemap.xml"); revalidatePath("/services");
  const paths = new Set([...(previous?.services || []), ...project.services]);
  for (const service of paths) for (const page of servicePages) if (service === page.path || service.startsWith(page.path + "/")) revalidatePath(page.path);
}
