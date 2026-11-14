export const projectStatuses = { draft: "پیش‌نویس", published: "منتشرشده", archived: "بایگانی" } as const;
export type ProjectStatus = keyof typeof projectStatuses;
export type ProjectMedia = { id: string; alt: string; caption: string; posterId: string; duration: number; captions?: string };
export type ProjectInput = {
  title: string; slug: string; summary: string; client: string; industry: string; year: string; duration: string; website: string;
  services: string[]; tags: string[]; technologies: string[]; challenge: string; solution: string; outcome: string;
  sections: { heading: string; body: string; bullets: string[] }[];
  faq: { question: string; answer: string }[];
  coverId: string; coverAlt: string; media: ProjectMedia[];
  seoTitle: string; seoDescription: string; status: ProjectStatus; featured: boolean; sortOrder: number;
};
export type ProjectDTO = ProjectInput & { id: string; version: number; createdAt: string; updatedAt: string; publishedAt: string | null };
export type MediaAsset = { id: string; kind: "image" | "video"; name: string; bytes: number; mime: string; width: number; height: number; uploadedAt: string };
export type ProjectView = ProjectDTO & { assets: MediaAsset[] };
export const projectImageLimit = 8 * 1024 * 1024;
export const projectVideoLimit = 80 * 1024 * 1024;
export const projectAssetLimit = 32;
export const projectIdPattern = /^[a-f0-9-]{36}$/;
export const mediaIdPattern = /^[a-f0-9]{24}$/;
export const projectPath = (slug: string) => `/portfolio/${encodeURIComponent(slug)}`;
export const mediaPath = (id: string, preview = false) => preview ? `/api/admin/project-media/${id}` : `/media/projects/${id}`;
export function projectSlug(value: string) {
  return value.normalize("NFKC").trim().toLowerCase().replace(/[\s\u200c_]+/g, "-").replace(/[^\p{L}\p{N}-]/gu, "").replace(/-+/g, "-").replace(/^-|-$/g, "").slice(0, 120);
}
export function emptyProject(): ProjectInput {
  return { title: "", slug: "", summary: "", client: "", industry: "", year: "", duration: "", website: "", services: [], tags: [], technologies: [], challenge: "", solution: "", outcome: "", sections: [], faq: [], coverId: "", coverAlt: "", media: [], seoTitle: "", seoDescription: "", status: "draft", featured: false, sortOrder: 0 };
}
export function validateProject(raw: Record<string, unknown>, allowedServices: readonly string[]) {
  const data = emptyProject(), errors: Record<string, string> = {};
  const limits: Record<string, number> = { title: 140, slug: 120, summary: 600, client: 140, industry: 120, year: 30, duration: 80, website: 500, challenge: 8000, solution: 12000, outcome: 8000, coverId: 24, coverAlt: 250, seoTitle: 160, seoDescription: 320 };
  for (const [key, limit] of Object.entries(limits)) {
    const value = raw[key];
    if (typeof value !== "string" || value.length > limit) errors[key] = `این فیلد باید متن و حداکثر ${limit.toLocaleString("fa-IR")} نویسه باشد.`;
    else Object.assign(data, { [key]: value.trim() });
  }
  if (data.title.length < 2) errors.title = "عنوان پروژه را وارد کنید.";
  if (!data.slug || projectSlug(data.slug) !== data.slug) errors.slug = "نشانی را با حروف، عدد و خط تیره بنویسید.";
  for (const key of ["services", "tags", "technologies"] as const) {
    const value = raw[key];
    if (!Array.isArray(value) || value.length > (key === "services" ? 60 : 20) || value.some(item => typeof item !== "string" || item.length > 180)) errors[key] = "فهرست واردشده معتبر نیست.";
    else data[key] = [...new Set(value.map(item => item.trim()).filter(Boolean))];
  }
  if (data.services.some(path => !allowedServices.includes(path))) errors.services = "خدمات را از فهرست سایت انتخاب کنید.";
  if (data.website) { try { const url = new URL(data.website); if (url.protocol !== "https:" || url.username || url.password) throw new Error(); data.website = url.href; } catch { errors.website = "یک نشانی کامل و امن با https:// وارد کنید."; } }
  if (!(typeof raw.status === "string" && Object.hasOwn(projectStatuses, raw.status))) errors.status = "وضعیت پروژه معتبر نیست.";
  else data.status = raw.status as ProjectStatus;
  if (typeof raw.featured !== "boolean") errors.featured = "انتخاب پروژهٔ ویژه معتبر نیست."; else data.featured = raw.featured;
  if (!Number.isInteger(raw.sortOrder) || Number(raw.sortOrder) < 0 || Number(raw.sortOrder) > 9999) errors.sortOrder = "ترتیب نمایش باید عددی بین صفر و ۹۹۹۹ باشد.";
  else data.sortOrder = Number(raw.sortOrder);
  if (!Array.isArray(raw.sections) || raw.sections.length > 12) errors.sections = "حداکثر ۱۲ بخش توضیحی قابل ثبت است.";
  else for (const section of raw.sections) {
    if (!section || typeof section !== "object" || typeof section.heading !== "string" || !section.heading.trim() || section.heading.length > 160 || typeof section.body !== "string" || section.body.length > 10000 || !Array.isArray(section.bullets) || section.bullets.length > 20 || section.bullets.some((item: unknown) => typeof item !== "string" || item.length > 500)) errors.sections = "عنوان، متن و موارد بخش‌های توضیحی را بررسی کنید.";
    else data.sections.push({ heading: section.heading.trim(), body: section.body.trim(), bullets: section.bullets.map((item: string) => item.trim()).filter(Boolean) });
  }
  if (!Array.isArray(raw.faq) || raw.faq.length > 12) errors.faq = "حداکثر ۱۲ پرسش قابل ثبت است.";
  else for (const item of raw.faq) {
    if (!item || typeof item.question !== "string" || !item.question.trim() || item.question.length > 250 || typeof item.answer !== "string" || !item.answer.trim() || item.answer.length > 3000) errors.faq = "پرسش و پاسخ را کامل کنید.";
    else data.faq.push({ question: item.question.trim(), answer: item.answer.trim() });
  }
  if (!Array.isArray(raw.media) || raw.media.length > projectAssetLimit) errors.media = "تعداد فایل‌های پروژه بیش از حد مجاز است.";
  else for (const item of raw.media) {
    if (!item || typeof item.id !== "string" || !mediaIdPattern.test(item.id) || typeof item.alt !== "string" || item.alt.length > 250 || typeof item.caption !== "string" || item.caption.length > 1000 || typeof item.posterId !== "string" || (item.posterId && !mediaIdPattern.test(item.posterId)) || typeof item.duration !== "number" || !Number.isFinite(item.duration) || item.duration < 0 || item.duration > 21600) errors.media = "اطلاعات رسانه‌ها معتبر نیست.";
    else if (item.captions !== undefined && (typeof item.captions !== "string" || item.captions.length > 30000 || (item.captions.trim() && !/^WEBVTT(?:[ \t].*)?\r?\n/.test(item.captions)) || item.captions.includes("\0"))) errors.media = "زیرنویس باید WebVTT و حداکثر ۳۰ هزار نویسه باشد.";
    else data.media.push({ id: item.id, alt: item.alt.trim(), caption: item.caption.trim(), posterId: item.posterId, duration: item.duration, captions: item.captions || "" });
  }
  if (new Set(data.media.map(item => item.id)).size !== data.media.length) errors.media = "یک فایل را فقط یک بار به گالری اضافه کنید.";
  if (data.coverId && !mediaIdPattern.test(data.coverId)) errors.coverId = "تصویر جلد معتبر نیست.";
  if (data.status === "published") {
    if (data.summary.length < 30) errors.summary = "برای انتشار، معرفی کوتاه و روشنی از پروژه بنویسید.";
    if (!data.services.length) errors.services = "حداقل یک خدمت مرتبط انتخاب کنید.";
    if (!data.coverId) errors.coverId = "برای انتشار یک تصویر جلد انتخاب کنید.";
    if (!data.coverAlt) errors.coverAlt = "توضیح تصویر جلد را وارد کنید.";
    if (![data.challenge, data.solution, ...data.sections.map(item => item.body)].some(text => text.length >= 40)) errors.solution = "شرح پروژه یا روش اجرای آن را کامل کنید.";
  }
  return { data, errors };
}
