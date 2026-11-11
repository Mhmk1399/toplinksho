import { test, expect, type Page, type APIRequestContext } from "@playwright/test";
import { randomUUID } from "node:crypto";
import AxeBuilder from "@axe-core/playwright";

const origin = "http://127.0.0.1:3196";
const routes = ["/", "/about-us", "/services", "/contact"];
let client = 1;
test.beforeEach(async ({ context }) => {
  await context.setExtraHTTPHeaders({ "x-forwarded-for": `198.51.100.${client++}` });
});

async function signIn(page: Page) {
  const response = await page.request.post("/api/admin/login", { headers: { Origin: origin }, data: { email: "admin@toplinksho.invalid", password: process.env.TOPLINKSHO_E2E_PASSWORD } });
  expect(response.status()).toBe(200);
  await page.goto("/admin");
}

async function seed(request: APIRequestContext, name = `آزمایش ${randomUUID().slice(0, 8)}`) {
  const response = await request.post("/api/consultations", { headers: { Origin: origin }, data: { name, phone: "۰۹۱۲۱۲۳۴۵۶۷", subject: "طراحی سایت", description: "درخواست آزمایشیِ مرورگر", website: "@example", company: "", submissionId: randomUUID() } });
  expect(response.status()).toBe(201);
  return { name, reference: (await response.json()).reference as string };
}

test("main pages share the home hero and fit desktop and small phones", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  for (const width of [1440, 390, 320]) {
    await page.setViewportSize({ width, height: 950 });
    for (const route of routes) {
      const response = await page.goto(route);
      expect(response?.status()).toBe(200);
      await page.evaluate(() => document.fonts.ready);
      await expect(page.locator("h1")).toHaveCount(1);
      await expect(page.locator(".hero-stage .hero-grid")).toBeVisible();
      expect(await page.locator(".hero-image").evaluate((image: HTMLImageElement) => image.complete && image.naturalWidth > 0)).toBe(true);
      const geometry = await page.evaluate(() => {
        const copy = document.querySelector(".hero-copy")!.getBoundingClientRect();
        const art = document.querySelector(".hero-art")!.getBoundingClientRect();
        const heading = document.querySelector("h1")!;
        const range = document.createRange(); range.selectNodeContents(heading);
        return { overflow: document.documentElement.scrollWidth > innerWidth, copyBottom: copy.bottom, artTop: art.top, text: range.getBoundingClientRect().toJSON(), width: innerWidth };
      });
      expect(geometry.overflow, `${route} at ${width}`).toBe(false);
      expect(geometry.text.left, `${route} title left at ${width}`).toBeGreaterThanOrEqual(0);
      expect(geometry.text.right, `${route} title right at ${width}`).toBeLessThanOrEqual(width);
      if (width < 768) expect(geometry.artTop).toBeGreaterThanOrEqual(geometry.copyBottom - 1);
      await expect(page.locator(".nav-shell .brand-logo")).toHaveAttribute("src", "/images/logo.webp");
      expect(await page.locator("iframe").count()).toBe(0);
      if (width === 390) await page.screenshot({ path: `artifacts/${route === "/" ? "home" : route.slice(1)}-mobile.png` });
    }
  }
});

test("mobile navigation works by keyboard, closes on navigation and restores scrolling", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  const trigger = page.getByRole("button", { name: "باز کردن منو" });
  await trigger.click();
  const dialog = page.getByRole("dialog", { name: "منوی اصلی" });
  await expect(dialog).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(dialog).not.toBeVisible();
  await expect(trigger).toBeFocused();
  await trigger.click();
  await dialog.getByRole("link", { name: "درباره ما", exact: true }).click();
  await expect(page).toHaveURL(/\/about-us$/);
  await expect(dialog).not.toBeVisible();
  expect(await page.evaluate(() => document.body.style.overflow)).toBe("");
});

test("all service detail heroes fit the smallest supported phone", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.setViewportSize({ width: 320, height: 900 });
  for (const slug of ["web-design", "social-media", "branding", "google-ads", "campaigns", "graphic-design", "content-production", "seo", "online-advertising"]) {
    await page.goto(`/services/${slug}`);
    await page.evaluate(() => document.fonts.ready);
    const bounds = await page.locator("h1").evaluate(heading => { const range = document.createRange(); range.selectNodeContents(heading); return range.getBoundingClientRect().toJSON(); });
    expect(bounds.left, slug).toBeGreaterThanOrEqual(0);
    expect(bounds.right, slug).toBeLessThanOrEqual(320);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), slug).toBe(true);
  }
});

test("public form validates, saves a real request, and it appears in admin", async ({ page }) => {
  await page.goto("/contact#consultation");
  const form = page.getByRole("form", { name: "فرم مشاوره رایگان" });
  await form.getByRole("button", { name: "ارسال درخواست", exact: true }).click();
  await expect(form.getByLabel("نام و نام خانوادگی *", { exact: true })).toBeFocused();
  await expect(form.locator('[aria-invalid="true"]')).toHaveCount(3);
  const name = `کلینیک آزمایشی ${randomUUID().slice(0, 6)}`;
  await form.getByLabel("نام و نام خانوادگی *", { exact: true }).fill(name);
  await form.getByLabel("شماره تماس *", { exact: true }).fill("۰۹۱۲۱۲۳۴۵۶۷");
  await form.getByLabel("مشاوره در زمینهٔ *", { exact: true }).selectOption("طراحی سایت");
  await form.getByLabel("در چه موردی به مشاوره نیاز دارید؟", { exact: true }).fill("برای طراحی سایت جدید به مشاوره نیاز داریم.");
  await form.getByRole("button", { name: "ارسال درخواست", exact: true }).click();
  await expect(page.getByRole("heading", { name: "درخواست شما ثبت شد." })).toBeVisible();
  const reference = await page.locator('[role="status"] p[dir="ltr"]').textContent();
  expect(reference).toMatch(/^TLS-/);
  await signIn(page);
  await expect(page.getByRole("link", { name: `بررسی درخواست ${name}`, exact: true })).toBeVisible();
  await page.getByRole("link", { name: `بررسی درخواست ${name}`, exact: true }).click();
  await expect(page.getByRole("heading", { name, exact: true })).toBeVisible();
  await expect(page.getByText(reference!, { exact: true })).toBeVisible();
  await expect(page.getByText("برای طراحی سایت جدید به مشاوره نیاز داریم.", { exact: true })).toBeVisible();
});

test("form failure preserves values and retries with the same submission key", async ({ page }) => {
  await page.goto("/contact#consultation");
  const form = page.getByRole("form", { name: "فرم مشاوره رایگان" });
  await form.getByLabel("نام و نام خانوادگی *", { exact: true }).fill("آزمایش حفظ اطلاعات");
  await form.getByLabel("شماره تماس *", { exact: true }).fill("09121234567");
  await form.getByLabel("مشاوره در زمینهٔ *", { exact: true }).selectOption("شبکه‌های اجتماعی");
  let submissionId = "";
  await page.route("**/api/consultations", async route => {
    submissionId = route.request().postDataJSON().submissionId;
    await route.fulfill({ status: 503, contentType: "application/json", body: JSON.stringify({ error: "خطای آزمایشی اتصال" }) });
  });
  await form.getByRole("button", { name: "ارسال درخواست", exact: true }).click();
  await expect(form.getByRole("alert")).toContainText("خطای آزمایشی اتصال");
  await expect(form.getByLabel("نام و نام خانوادگی *", { exact: true })).toHaveValue("آزمایش حفظ اطلاعات");
  await page.unroute("**/api/consultations");
  const request = page.waitForRequest(request => request.url().endsWith("/api/consultations") && request.method() === "POST");
  await form.getByRole("button", { name: "ارسال درخواست", exact: true }).click();
  expect((await request).postDataJSON().submissionId).toBe(submissionId);
  await expect(page.getByRole("heading", { name: "درخواست شما ثبت شد." })).toBeVisible();
});

test("admin search stays out of URLs; notes and status persist and drafts survive navigation", async ({ page }) => {
  const lead = await seed(page.request);
  await signIn(page);
  await page.getByLabel("جست‌وجو", { exact: true }).fill(lead.reference);
  await page.getByRole("button", { name: "جست‌وجو", exact: true }).click();
  await expect(page.getByText("۱ درخواست", { exact: false }).first()).toBeVisible();
  expect(page.url()).not.toContain(lead.reference);
  await page.getByRole("link", { name: `بررسی درخواست ${lead.name}`, exact: true }).click();
  await page.getByLabel("یادداشت داخلی تیم", { exact: true }).fill("پیش‌نویس محفوظ");
  await page.getByRole("link", { name: "بازگشت به درخواست‌ها" }).click();
  await expect(page.getByLabel("جست‌وجو", { exact: true })).toHaveValue(lead.reference);
  await page.getByRole("link", { name: `بررسی درخواست ${lead.name}`, exact: true }).click();
  await expect(page.getByLabel("یادداشت داخلی تیم", { exact: true })).toHaveValue("پیش‌نویس محفوظ");
  await expect(page.getByRole("link", { name: "مشاهدهٔ سایت", exact: true })).toHaveAttribute("target", "_blank");
  await page.getByRole("link", { name: "تاپ لینک شو، مدیریت درخواست‌ها", exact: true }).click();
  await page.getByRole("link", { name: `بررسی درخواست ${lead.name}`, exact: true }).click();
  await expect(page.getByLabel("یادداشت داخلی تیم", { exact: true })).toHaveValue("پیش‌نویس محفوظ");
  await page.getByLabel("وضعیت پیگیری", { exact: true }).selectOption("contacted");
  await page.getByRole("button", { name: "ذخیره تغییرات", exact: true }).click();
  await expect(page.getByText("تغییرات ذخیره شد.", { exact: true })).toBeVisible();
  await expect(page.getByText("تغییرات هنوز ذخیره نشده‌اند.", { exact: false })).not.toBeVisible();
  await page.reload();
  await expect(page.getByLabel("یادداشت داخلی تیم", { exact: true })).toHaveValue("پیش‌نویس محفوظ");
  await expect(page.getByLabel("وضعیت پیگیری", { exact: true })).toHaveValue("contacted");
});

test("admin login, password visibility, unsaved logout dialog and session revocation", async ({ page }) => {
  const lead = await seed(page.request);
  await page.goto("/admin/login");
  await page.getByLabel("ایمیل مدیریت", { exact: true }).fill("admin@toplinksho.invalid");
  await page.getByLabel("رمز عبور", { exact: true }).fill(process.env.TOPLINKSHO_E2E_PASSWORD!);
  await page.getByRole("button", { name: "نمایش رمز عبور" }).click();
  await expect(page.getByLabel("رمز عبور", { exact: true })).toHaveAttribute("type", "text");
  await page.getByRole("button", { name: "پنهان کردن رمز عبور" }).click();
  await page.getByRole("button", { name: "ورود به پنل", exact: true }).click();
  await expect(page).toHaveURL(/\/admin$/);
  await page.getByRole("link", { name: `بررسی درخواست ${lead.name}`, exact: true }).click();
  await page.getByLabel("یادداشت داخلی تیم", { exact: true }).fill("پیش‌نویس هنگام خروج");
  await page.getByRole("button", { name: "خروج", exact: true }).click();
  const dialog = page.getByRole("dialog", { name: "تغییرات ذخیره نشده" });
  await expect(dialog).toBeVisible();
  await dialog.getByRole("button", { name: "ادامهٔ ویرایش", exact: true }).click();
  await expect(dialog).not.toBeVisible();
  await expect(page.getByLabel("یادداشت داخلی تیم", { exact: true })).toHaveValue("پیش‌نویس هنگام خروج");
  await page.getByRole("button", { name: "خروج", exact: true }).click();
  await dialog.getByRole("button", { name: "خروج و کنارگذاشتن پیش‌نویس‌ها", exact: true }).click();
  await expect(page).toHaveURL(/\/admin\/login$/);
  await page.goto("/admin");
  await expect(page).toHaveURL(/\/admin\/login/);
});

test("hero motion pauses offscreen and weak devices keep native scrolling", async ({ page, browser }) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("/about-us");
  await expect(page.locator(".hero-art")).toHaveAttribute("data-active", "true");
  await page.evaluate(() => window.scrollTo({ top: document.documentElement.scrollHeight, behavior: "instant" }));
  await expect(page.locator(".hero-art")).toHaveAttribute("data-active", "false");
  expect(await page.locator(".hero-visual").evaluate(node => getComputedStyle(node).animationPlayState)).toBe("paused");
  await page.emulateMedia({ reducedMotion: "reduce" });
  expect(await page.locator(".hero-visual").evaluate(node => getComputedStyle(node).animationName)).toBe("none");
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  await context.addInitScript(() => {
    Object.defineProperty(navigator, "hardwareConcurrency", { get: () => 2 });
    Object.defineProperty(navigator, "deviceMemory", { get: () => 2 });
  });
  const weak = await context.newPage();
  await weak.goto(`${origin}/services`);
  await expect(weak.locator("html")).toHaveAttribute("data-performance", "reduced");
  await expect(weak.locator("html")).toHaveAttribute("data-scroll-mode", "native");
  expect(await weak.locator(".hero-visual").evaluate(node => getComputedStyle(node).animationName)).toBe("none");
  expect(await weak.locator(".nav-shell").evaluate(node => getComputedStyle(node).backdropFilter)).toBe("none");
  await context.close();
});

test("admin mobile view has reachable actions and email configuration feedback", async ({ page }) => {
  await seed(page.request);
  await signIn(page);
  await page.setViewportSize({ width: 390, height: 844 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await expect(page.getByRole("heading", { name: "درخواست‌های مشاوره", exact: true })).toBeVisible();
  await page.screenshot({ path: "artifacts/admin-mobile.png" });
  await page.getByRole("link", { name: "تنظیمات", exact: true }).click();
  await page.getByRole("button", { name: "بررسی اتصال ایمیل", exact: true }).click();
  await expect(page.getByText("تنظیمات سرویس ایمیل هنوز کامل نیست.", { exact: true })).toBeVisible();
  expect(await page.locator(".site-header").count()).toBe(0);
  expect(await page.locator(".site-footer").count()).toBe(0);
});

test("contact and admin interfaces pass automated accessibility checks", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  for (const route of ["/contact", "/admin/login"]) {
    await page.goto(route);
    await page.evaluate(() => document.fonts.ready);
    const report = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa"]).analyze();
    expect(report.violations, JSON.stringify(report.violations, null, 2)).toEqual([]);
  }
  await signIn(page);
  const report = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa"]).analyze();
  expect(report.violations, JSON.stringify(report.violations, null, 2)).toEqual([]);
});

test("map loads only after an explicit request", async ({ page }) => {
  await page.goto("/contact");
  await expect(page.locator("iframe")).toHaveCount(0);
  await page.route("https://maps.google.com/**", route => route.fulfill({ contentType: "text/html", body: "<html lang='fa'><title>نقشهٔ آزمایشی</title></html>" }));
  await page.getByRole("button", { name: "نمایش نقشه", exact: true }).click();
  await expect(page.getByTitle("نقشهٔ دفتر تاپ لینک شو در ستارخان تهران")).toBeVisible();
});

test("PWA registers, installs on request, serves public pages offline and excludes private data", async ({ page, context }) => {
  await page.goto("/services");
  await page.evaluate(async () => { await navigator.serviceWorker.ready; });
  await expect.poll(() => page.evaluate(() => !!navigator.serviceWorker.controller)).toBe(true);
  await page.reload();
  await expect.poll(() => page.evaluate(async () => {
    const key = (await caches.keys()).find(key => key.startsWith("toplinksho-pages-"));
    return key ? !!await (await caches.open(key)).match(location.href, { ignoreVary: true }) : false;
  })).toBe(true);
  await page.evaluate(async () => {
    await fetch("/admin", { redirect: "manual" });
    await fetch("/api/consultations");
    const event = new Event("beforeinstallprompt", { cancelable: true });
    Object.assign(event, { prompt: async () => { document.documentElement.dataset.installRequested = "true"; }, userChoice: Promise.resolve({ outcome: "accepted" }) });
    window.dispatchEvent(event);
  });
  await page.getByRole("button", { name: "نصب تاپ لینک شو", exact: true }).click();
  await expect(page.locator("html")).toHaveAttribute("data-install-requested", "true");
  const cachedUrls = await page.evaluate(async () => {
    const urls: string[] = [];
    for (const name of await caches.keys()) for (const key of await (await caches.open(name)).keys()) urls.push(key.url);
    return urls;
  });
  expect(cachedUrls.some(url => /\/admin|\/api\/|_rsc/.test(url))).toBe(false);
  await context.setOffline(true);
  await page.goto("/services");
  await expect(page.locator(".hero-stage")).toBeVisible();
  await page.goto("/about-us");
  await expect(page.getByRole("heading", { name: "فعلاً به اینترنت وصل نیستید." })).toBeVisible();
  await context.setOffline(false);
  await page.goto("/about-us");
  await expect(page.locator(".hero-stage")).toBeVisible();
});

test("every public route has distinct metadata, canonical and content-derived JSON-LD", async ({ page }) => {
  const paths = [...routes, "/services/web-design", "/services/seo"];
  const titles = new Set<string>();
  for (const path of paths) {
    await page.goto(path);
    const title = await page.title();
    expect(titles.has(title)).toBe(false); titles.add(title);
    expect(new URL((await page.locator('link[rel="canonical"]').getAttribute("href"))!).href).toBe("https://toplinksho.com" + (path === "/" ? "/" : path));
    await expect(page.locator('meta[property="og:locale"]')).toHaveAttribute("content", "fa_IR");
    await expect(page.locator('meta[name="twitter:card"]')).toHaveAttribute("content", "summary_large_image");
    const graph = await page.locator('script[type="application/ld+json"]').evaluate(element => JSON.parse(element.textContent || "{}"));
    expect(graph["@context"]).toBe("https://schema.org");
    expect(graph["@graph"].some((node: Record<string, unknown>) => node["@type"] === "WebSite")).toBe(true);
    if (path.startsWith("/services/")) {
      const faq = graph["@graph"].find((node: Record<string, unknown>) => node["@type"] === "FAQPage");
      expect(faq.mainEntity).toHaveLength(await page.locator("details").count());
      expect(graph["@graph"].some((node: Record<string, unknown>) => node["@type"] === "Service")).toBe(true);
    }
  }
  await page.goto("/admin/login");
  await expect(page.locator('script[type="application/ld+json"]')).toHaveCount(0);
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/);
});
