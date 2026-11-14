import { randomUUID } from "node:crypto";
import { test, expect, type Page } from "@playwright/test";
import sharp from "sharp";
import { readFileSync } from "node:fs";
import AxeBuilder from "@axe-core/playwright";
import { emptyProject, type ProjectDTO, type ProjectInput, type MediaAsset } from "../lib/projects";

const origin = "http://127.0.0.1:3196";
const headers = { Origin: origin, "Content-Type": "application/json" };
const service = "/services/development/web-development/booking-system-development";
async function login(page: Page) {
  const response = await page.request.post("/api/admin/login", { headers, data: { email: "admin@toplinksho.invalid", password: process.env.TOPLINKSHO_E2E_PASSWORD } });
  expect(response.status()).toBe(200);
}
async function sampleImage() { return sharp({ create: { width: 640, height: 400, channels: 4, background: { r: 52, g: 61, b: 181, alpha: 1 } } }).png().toBuffer(); }

test("projects publish with protected media, schemas, service assignment, ranges and reversible archiving", async ({ page, browser }) => {
  test.setTimeout(100000);
  await login(page);
  const id = randomUUID(), slug = "booking-" + id.slice(0, 8), title = "نمونهٔ آزمون سامانه رزرو " + id.slice(0, 8);
  let project: ProjectDTO | null = null;
  const anon = await browser.newContext({ baseURL: origin });
  try {
    const initial = { ...emptyProject(), id, title, slug, services: [service] };
    expect((await anon.request.post("/api/admin/projects", { headers, data: initial })).status()).toBe(401);
    expect((await page.request.post("/api/admin/projects", { headers: { ...headers, Origin: "https://elsewhere.invalid" }, data: initial })).status()).toBe(403);
    const [created, concurrentRetry] = await Promise.all([page.request.post("/api/admin/projects", { headers, data: initial }), page.request.post("/api/admin/projects", { headers, data: initial })]);
    expect(concurrentRetry.status()).toBe(201);
    expect(created.status()).toBe(201); project = (await created.json()).project;
    expect((await (await page.request.post("/api/admin/projects", { headers, data: initial })).json()).project.version).toBe(1);
    expect((await page.request.get(`/portfolio/${slug}`)).status()).toBe(404);
    const invalid = await page.request.patch(`/api/admin/projects/${id}`, { headers, data: { ...project, status: "published" } });
    expect(invalid.status()).toBe(422); expect((await invalid.json()).fields.coverId).toBeTruthy();
    const upload = async (data: Buffer, mime: string, name: string): Promise<MediaAsset> => {
      const response = await page.request.post("/api/admin/project-media", { headers: { Origin: origin, "Content-Type": mime, "x-project-id": id, "x-file-name": encodeURIComponent(name) }, data });
      expect(response.status(), await response.text()).toBe(201); return (await response.json()).asset;
    };
    const image = await upload(await sampleImage(), "image/png", "جلد نمونه.png");
    expect(image.mime).toBe("image/webp");
    const spoof = await page.request.post("/api/admin/project-media", { headers: { Origin: origin, "Content-Type": "image/png", "x-project-id": id }, data: Buffer.from("<svg><script>alert(1)</script></svg>") });
    expect(spoof.status()).toBe(415);
    expect((await page.request.get(`/media/projects/${image.id}`)).status()).toBe(404);
    expect((await anon.request.get(`/api/admin/project-media/${image.id}`)).status()).toBe(401);
    const privateImage = await page.request.get(`/api/admin/project-media/${image.id}`);
    expect(privateImage.status()).toBe(200); expect(privateImage.headers()["cache-control"]).toContain("private");
    const videoBytes = readFileSync("tests/fixtures/project-demo.webm"), video = await upload(videoBytes, "video/webm", "دموی رزرو.webm");
    const ready: ProjectInput = { ...project!, title, slug, services: [service], summary: "معرفی یک سامانهٔ رزرو با مدیریت ظرفیت و پیگیری درخواست‌های مشتریان در این پروژهٔ آزمایشی.", solution: "مسیر انتخاب زمان، ثبت درخواست و بررسی ظرفیت را برای مشتری و مسئول اجرا طراحی و پیاده‌سازی کردیم.", challenge: "هماهنگی زمان و ظرفیت خدمت در یک مسیر روشن.", outcome: "فرایند ثبت درخواست در یک رابط قابل استفاده ارائه شد.", coverId: image.id, coverAlt: "نمای رابط سامانه رزرو", media: [{ id: image.id, alt: "صفحهٔ رزرو", caption: "نمونهٔ رابط", posterId: "", duration: 0 }, { id: video.id, alt: "دموی گردش رزرو", caption: "نمایش مراحل رزرو", posterId: image.id, duration: 1, captions: "WEBVTT\n\n00:00:00.000 --> 00:00:01.000\nنمایش مسیر رزرو\n" }], faq: [{ question: "چه چیزی در این پروژه ساخته شد؟", answer: "رابط رزرو، بررسی ظرفیت و پیگیری درخواست‌ها." }], seoTitle: title + " | نمونه‌کار", seoDescription: "جزئیات و نمونهٔ تصویری اجرای سامانه رزرو و مدیریت ظرفیت در یک پروژهٔ آزمایشی.", status: "published" };
    const published = await page.request.patch(`/api/admin/projects/${id}`, { headers, data: { ...ready, version: project!.version } });
    expect(published.status(), await published.text()).toBe(200); project = (await published.json()).project;
    expect((await page.request.patch(`/api/admin/projects/${id}`, { headers, data: { ...ready, version: 1 } })).status()).toBe(409);
    const duplicate = await page.request.post("/api/admin/projects", { headers, data: { ...emptyProject(), id: randomUUID(), title: "نسخهٔ دیگر", slug } });
    expect(duplicate.status()).toBe(409);
    expect((await page.request.delete(`/api/admin/project-media/${image.id}`, { headers })).status()).toBe(409);
    await page.goto(`/portfolio/${slug}`);
    await expect(page.getByRole("heading", { level: 1, name: title, exact: true })).toBeVisible();
    await expect(page).toHaveTitle(ready.seoTitle);
    expect(await page.locator('link[rel="canonical"]').getAttribute("href")).toBe(`${origin}/portfolio/${slug}`);
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/);
    const graphs = await page.locator('script[type="application/ld+json"]').evaluateAll(nodes => nodes.map(node => JSON.parse(node.textContent!)));
    const nodes = graphs.flatMap(graph => graph["@graph"] || [graph]);
    expect(nodes.some(node => node["@type"] === "CreativeWork" && node.name === title)).toBe(true);
    expect(nodes.some(node => node["@type"] === "VideoObject" && node.duration === "PT1S")).toBe(true);
    expect(nodes.some(node => node["@type"] === "FAQPage")).toBe(true);
    const player = page.getByLabel("دموی گردش رزرو", { exact: true });
    await expect(player).toHaveAttribute("preload", "none"); expect(await player.getAttribute("autoplay")).toBeNull();
    await player.scrollIntoViewIfNeeded();
    expect(await player.evaluate(async element => { const video = element as HTMLVideoElement; await Promise.race([video.play(), new Promise((_, reject) => setTimeout(() => reject(new Error(video.error?.message || "Video did not become playable")), 8000))]); video.pause(); return video.readyState; })).toBeGreaterThanOrEqual(2);
    await expect(player.locator('track[kind="captions"]')).toHaveCount(1);
    expect((await page.request.get(`/media/projects/${video.id}/captions`)).status()).toBe(200);
    const range = await page.request.get(`/media/projects/${video.id}`, { headers: { Range: "bytes=0-15" } });
    expect(range.status()).toBe(206); expect(await range.body()).toEqual(videoBytes.subarray(0, 16));
    expect((await page.request.get(`/media/projects/${video.id}`, { headers: { Range: "bytes=999999999-" } })).status()).toBe(416);
    const head = await page.request.head(`/media/projects/${video.id}`, { headers: { Range: "bytes=0-0" } });
    expect(head.status()).toBe(206); expect(head.headers()["content-range"]).toBe(`bytes 0-0/${videoBytes.length}`); expect((await head.body()).length).toBe(0);
    const list = await page.request.get(`/portfolio?service=${encodeURIComponent(service)}`); expect(await list.text()).toContain(title);
    await expect.poll(async () => (await (await page.request.get(service)).text()).includes(`/portfolio/${slug}`)).toBe(true);
    await page.setViewportSize({ width: 390, height: 844 }); await page.goto(`/portfolio/${slug}`);
    expect(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)).toBe(false);
    const a11y = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa"]).analyze(); expect(a11y.violations).toEqual([]);
    await page.screenshot({ path: "artifacts/project-detail-mobile.png", fullPage: true });
    const unused = await upload(await sampleImage(), "image/png", "استفاده نشده.png");
    expect((await page.request.delete(`/api/admin/project-media/${unused.id}`, { headers })).status()).toBe(200);
    expect((await page.request.delete(`/api/admin/project-media/${unused.id}`, { headers })).status()).toBe(200);
    const archived = await page.request.patch(`/api/admin/projects/${id}`, { headers, data: { ...project, status: "archived" } }); expect(archived.status()).toBe(200); project = (await archived.json()).project;
    expect((await page.request.get(`/portfolio/${slug}`)).status()).toBe(404); expect((await page.request.get(`/media/projects/${image.id}`)).status()).toBe(404);
    const restored = await page.request.patch(`/api/admin/projects/${id}`, { headers, data: { ...project, status: "published" } }); expect(restored.status()).toBe(200); project = (await restored.json()).project;
    expect((await page.request.get(`/portfolio/${slug}`)).status()).toBe(200);
  } finally {
    const current = await page.request.get(`/api/admin/projects/${id}`, { timeout: 5000 }).catch(() => null);
    if (current?.ok()) await page.request.patch(`/api/admin/projects/${id}`, { headers, data: { ...(await current.json()).project, status: "archived" }, timeout: 5000 }).catch(() => null);
    await anon.close();
  }
});

test("project editor preserves drafts, uploads media and recovers from failed and conflicting saves", async ({ page }) => {
  test.setTimeout(100000);
  await login(page); await page.goto("/admin/projects/new");
  const title = "نمونه‌کار فرم " + randomUUID().slice(0, 8), slug = "editor-" + randomUUID().slice(0, 8);
  await page.getByLabel("عنوان پروژه *", { exact: true }).fill(title); await page.getByLabel("نشانی پروژه *", { exact: true }).fill(slug);
  await page.locator("#project-services details").first().locator("summary").click();
  await page.getByLabel("توسعه سامانه رزرو", { exact: true }).check();
  await page.getByRole("button", { name: "ذخیرهٔ پروژه", exact: true }).click();
  await expect(page).toHaveURL(/\/admin\/projects\/[a-f0-9-]{36}$/); const id = page.url().split("/").at(-1)!;
  try {
    await page.locator("#project-upload").setInputFiles({ name: "رابط.png", mimeType: "image/png", buffer: await sampleImage() });
    await page.getByRole("button", { name: "بارگذاری فایل", exact: true }).click();
    await expect(page.getByRole("status").filter({ hasText: "فایل ذخیره شد" })).toBeVisible();
    await page.getByLabel("معرفی کوتاه پروژه", { exact: true }).fill("طراحی و اجرای یک مسیر رزرو روشن برای انتخاب زمان، بررسی ظرفیت و پیگیری درخواست مشتریان.");
    await page.getByLabel("راهکار و مسیر اجرا", { exact: true }).fill("ابتدا نیازهای مسئول اجرا و مشتری را بررسی کردیم و سپس رابط رزرو و پیگیری درخواست‌ها را ساختیم.");
    await page.getByRole("navigation", { name: "ناوبری مدیریت" }).getByRole("link", { name: "پروژه‌ها", exact: true }).click();
    await page.getByRole("link", { name: `ویرایش ${title}`, exact: true }).click();
    await expect(page.getByLabel("معرفی کوتاه پروژه", { exact: true })).toHaveValue(/طراحی و اجرای/);
    await page.getByLabel("وضعیت انتشار", { exact: true }).selectOption("published");
    await page.route(`**/api/admin/projects/${id}`, route => route.request().method() === "PATCH" ? route.abort() : route.continue());
    await page.getByRole("button", { name: "ذخیره و انتشار پروژه", exact: true }).click();
    await expect(page.locator("[data-project-errors]")).toContainText("ارتباط برقرار نشد");
    await expect(page.getByLabel("راهکار و مسیر اجرا", { exact: true })).toHaveValue(/نیازهای مسئول اجرا/);
    await page.unroute(`**/api/admin/projects/${id}`);
    await page.getByRole("button", { name: "ذخیره و انتشار پروژه", exact: true }).click();
    await expect(page.getByRole("status").filter({ hasText: "پروژه منتشر شد" })).toBeVisible();
    const current = (await (await page.request.get(`/api/admin/projects/${id}`)).json()).project as ProjectDTO;
    expect((await page.request.patch(`/api/admin/projects/${id}`, { headers, data: { ...current, client: "ویرایش هم‌زمان سرور" } })).status()).toBe(200);
    await page.getByLabel("نام کارفرما (اختیاری)").fill("تغییر محفوظ من");
    await page.getByRole("button", { name: "ذخیره و انتشار پروژه", exact: true }).click();
    await expect(page.locator("[data-project-errors]")).toContainText("نسخهٔ جدیدتری");
    await expect(page.getByLabel("نام کارفرما (اختیاری)")).toHaveValue("تغییر محفوظ من");
    await page.getByRole("button", { name: "نسخه را بررسی کردم؛ ادامه با تغییرات من", exact: true }).click();
    await page.getByRole("button", { name: "ذخیره و انتشار پروژه", exact: true }).click();
    await expect(page.getByRole("status").filter({ hasText: "پروژه منتشر شد" })).toBeVisible();
    const preview = await page.context().newPage(); await preview.goto(`${origin}/admin/projects/${id}/preview`);
    await expect(preview.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/);
    await expect.poll(() => preview.locator(".hero-image").evaluate(image => (image as HTMLImageElement).naturalWidth)).toBeGreaterThan(0);
    expect(await preview.locator('script[type="application/ld+json"]').count()).toBe(0); await preview.close();
    await page.setViewportSize({ width: 320, height: 900 });
    await expect(page.getByRole("button", { name: "ذخیره و انتشار پروژه", exact: true })).toHaveCount(1);
    const saveBox = (await page.getByRole("button", { name: "ذخیره و انتشار پروژه", exact: true }).boundingBox())!;
    expect(saveBox.y + saveBox.height).toBeLessThanOrEqual(900);
    expect(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)).toBe(false);
    const a11y = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa"]).analyze(); expect(a11y.violations).toEqual([]);
    await page.evaluate(() => { (document.activeElement as HTMLElement | null)?.blur(); window.scrollTo({ top: 0, behavior: "instant" }); });
    await page.screenshot({ path: "artifacts/project-editor-mobile.png" });
    await page.getByLabel("نام کارفرما (اختیاری)").fill("پیش‌نویس خروج");
    await page.getByRole("button", { name: "خروج", exact: true }).click(); await expect(page.getByRole("dialog")).toBeVisible();
    await page.getByRole("button", { name: "ادامهٔ ویرایش", exact: true }).click();
    await expect(page.getByLabel("نام کارفرما (اختیاری)")).toHaveValue("پیش‌نویس خروج");
  } finally {
    const current = await page.request.get(`/api/admin/projects/${id}`);
    if (current.ok()) await page.request.patch(`/api/admin/projects/${id}`, { headers, data: { ...(await current.json()).project, status: "archived" } });
  }
});
