import "server-only";
import { cache } from "react";
import { createHash } from "node:crypto";
import { revalidatePath, revalidateTag, unstable_cache } from "next/cache";
import connect from "@/lib/server/db";
import Project from "@/models/Project";
import { servicePages } from "@/lib/page-registry";
import { emptyProject, validateProject, projectIdPattern, type ProjectDTO, type ProjectInput, type ProjectStatus } from "@/lib/projects";
import { assetList, deleteProjectAssets, validateProjectAssets } from "@/lib/server/project-media";
import { ProjectError } from "@/lib/server/project-errors";
import { acquireProjectLease, releaseProjectLease } from "@/lib/server/project-lock";

export { ProjectError } from "@/lib/server/project-errors";
// Isolate public caches between databases, including local preview/test servers.
const cacheScope = createHash("sha256").update(JSON.stringify([process.env.MONGODB_URI || "", process.env.MONGODB_DB_NAME || ""])).digest("hex");
const publicProjectsTag = `public-projects:${cacheScope}`;
const publicCacheOptions = { revalidate: 60, tags: [publicProjectsTag] };
export const projectServices = servicePages.filter(page => page.path !== "/services").map(page => ({ path: page.path, title: page.title, group: page.group || "growth", parent: page.parent || "/services" }));
function dto(row: Record<string, unknown>): ProjectDTO {
  const fields = Object.fromEntries(Object.keys(emptyProject()).map(key => [key, row[key]]));
  return JSON.parse(JSON.stringify({ ...fields, id: row.publicId, version: row.version, createdAt: row.createdAt, updatedAt: row.updatedAt, publishedAt: row.publishedAt || null, isDemo: row.isDemo === true, deletionPending: !!row.deletionRequestedAt })) as ProjectDTO;
}
export async function adminProject(id: string) {
  if (!projectIdPattern.test(id)) return null;
  await connect(); const row = await Project.findOne({ publicId: id }).lean();
  return row ? dto(row) : null;
}
const readPublishedProject = unstable_cache(async (slug: string) => {
  await connect(); const row = await Project.findOne({ slug, status: "published" }).lean();
  if (!row) return null;
  const project = dto(row);
  const ids = new Set([project.coverId, ...project.media.flatMap(item => [item.id, item.posterId])].filter(Boolean));
  return { ...project, assets: (await assetList(row.publicId, ids)).filter(asset => ids.has(asset.id)) };
}, ["published-project-v1", cacheScope], publicCacheOptions);
export const publishedProject = cache(async (slug: string) => {
  if (!process.env.MONGODB_URI || slug.length > 120) return null;
  return readPublishedProject(slug);
});

export const sitemapProjects = unstable_cache(async () => {
  if (!process.env.MONGODB_URI) return [];
  await connect();
  const rows = await Project.find({ status: "published", isDemo: { $ne: true } }).select("slug updatedAt coverId -_id").sort({ updatedAt: -1 }).limit(49000).lean();
  return rows.map(row => ({ slug: row.slug, updatedAt: row.updatedAt.toISOString(), coverId: row.coverId }));
}, ["project-sitemap-v1", cacheScope], publicCacheOptions);

export const hasIndexableProjects = unstable_cache(async () => {
  if (!process.env.MONGODB_URI) return false;
  await connect();
  return !!await Project.exists({ status: "published", isDemo: { $ne: true } });
}, ["indexable-projects-v1", cacheScope], publicCacheOptions);

type ProjectListOptions = { status?: ProjectStatus; service?: string; query?: string; page?: number; limit?: number; admin?: boolean };
async function queryProjects({ status, service, query = "", page = 1, limit = 12, admin = false }: ProjectListOptions) {
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
const readPublicProjects = unstable_cache(
  async (service: string, page: number, limit: number) => queryProjects({ service, page, limit }),
  ["public-project-list-v1", cacheScope], publicCacheOptions,
);
export async function listProjects(options: ProjectListOptions = {}) {
  // Private listings and free-text searches always read current database state.
  if (options.admin || options.query?.trim() || !process.env.MONGODB_URI) return queryProjects(options);
  const service = projectServices.some(item => item.path === options.service) ? options.service! : "";
  const page = Number.isFinite(options.page) ? Math.max(1, Math.floor(options.page!)) : 1;
  const limit = Number.isFinite(options.limit) ? Math.max(1, Math.min(24, Math.floor(options.limit!))) : 12;
  return readPublicProjects(service, page, limit);
}
export async function saveProject(id: string, body: Record<string, unknown>, userId: string, creating = false) {
  if (!projectIdPattern.test(id)) throw new ProjectError("شناسهٔ پروژه معتبر نیست.");
  const { data, errors } = validateProject(body, projectServices.map(item => item.path));
  if (Object.keys(errors).length) throw new ProjectError("فیلدهای مشخص‌شده را بررسی کنید.", 422, errors);
  await connect(); await Project.init();
  const existing = await adminProject(id);
  if (existing?.deletionPending) throw new ProjectError("حذف این پروژه در حال تکمیل است. برای ادامه، دوباره گزینهٔ حذف را بزنید.", 409);
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
      : await Project.findOneAndUpdate({ publicId: id, version: Number(body.version), deletionRequestedAt: null }, { $set: values, $inc: { version: 1 } }, { returnDocument: "after", runValidators: true });
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
export async function deleteProject(id: string, body: Record<string, unknown>) {
  if (!projectIdPattern.test(id)) throw new ProjectError("شناسهٔ پروژه معتبر نیست.");
  if (!Number.isSafeInteger(body.version) || Number(body.version) < 1) throw new ProjectError("نسخهٔ پروژه معتبر نیست. صفحه را تازه‌سازی کنید.", 422);
  await connect();
  if (!await Project.exists({ publicId: id })) return;
  const lease = await acquireProjectLease(id);
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 45000);
  try {
    // Recheck under the same lease used by saving and uploading.
    const row = await Project.findOne({ publicId: id, uploadLockUntil: lease }).lean();
    if (!row) return;
    const previous = dto(row);
    if (!row.deletionRequestedAt) {
      if (row.version !== body.version) throw new ProjectError("پروژه تغییر کرده است. نسخهٔ جدید را بررسی و حذف را دوباره تأیید کنید.", 409);
      const marked = await Project.updateOne({ publicId: id, version: body.version, uploadLockUntil: lease }, { $set: { status: "archived", deletionRequestedAt: new Date() }, $inc: { version: 1 } });
      if (!marked.modifiedCount) throw new ProjectError("پروژه تغییر کرده است. نسخهٔ جدید را بررسی کنید.", 409);
    }
    // Removing a published page does not wait for remote file cleanup to finish.
    refreshProjectPages(previous, previous);
    revalidatePath("/admin/projects");
    try {
      await deleteProjectAssets(id, controller.signal);
      const result = await Project.deleteOne({ publicId: id, uploadLockUntil: lease, deletionRequestedAt: { $ne: null } });
      if (!result.deletedCount) throw new Error("Project deletion lease expired");
    } catch {
      throw new ProjectError("پاک‌سازی فایل‌های پروژه کامل نشد. پروژه از سایت برداشته شده است؛ برای تکمیل حذف، دوباره تلاش کنید.", 503);
    }
    refreshProjectPages(previous, previous);
    revalidatePath("/admin/projects");
    revalidatePath(`/admin/projects/${id}`);
  } finally {
    clearTimeout(timeout);
    await releaseProjectLease(id, lease);
  }
}
function refreshProjectPages(project: ProjectInput, previous: ProjectDTO | null) {
  // Route Handler writes must expire immediately, especially on unpublication.
  revalidateTag(publicProjectsTag, { expire: 0 });
  revalidatePath("/portfolio"); revalidatePath("/portfolio/[slug]", "page"); revalidatePath("/sitemap.xml"); revalidatePath("/services");
  const paths = new Set([...(previous?.services || []), ...project.services]);
  for (const service of paths) for (const page of servicePages) if (service === page.path || service.startsWith(page.path + "/")) revalidatePath(page.path);
}
