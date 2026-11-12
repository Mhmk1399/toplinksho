import { readFileSync } from "node:fs";
import { test, expect, type Page, type APIRequestContext } from "@playwright/test";
import { randomUUID } from "node:crypto";
import AxeBuilder from "@axe-core/playwright";
import sharp from "sharp";

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
  await form.getByLabel("مشاوره در زمینهٔ *", { exact: true }).selectOption("هوش مصنوعی و اتوماسیون");
  await form.getByLabel("در چه موردی به مشاوره نیاز دارید؟", { exact: true }).fill("برای ابزار هوش مصنوعی اختصاصی به مشاوره نیاز داریم.");
  await form.getByRole("button", { name: "ارسال درخواست", exact: true }).click();
  await expect(page.getByRole("heading", { name: "درخواست شما ثبت شد." })).toBeVisible();
  const reference = await page.locator('[role="status"] p[dir="ltr"]').textContent();
  expect(reference).toMatch(/^TLS-/);
  await signIn(page);
  await expect(page.getByRole("link", { name: `بررسی درخواست ${name}`, exact: true })).toBeVisible();
  await page.getByRole("link", { name: `بررسی درخواست ${name}`, exact: true }).click();
  await expect(page.getByRole("heading", { name, exact: true })).toBeVisible();
  await expect(page.getByText(reference!, { exact: true })).toBeVisible();
  await expect(page.getByText("برای ابزار هوش مصنوعی اختصاصی به مشاوره نیاز داریم.", { exact: true })).toBeVisible();
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
  // Metadata is prerendered with the owner's build-time APP_URL, including local previews.
  // Independent SEO configuration tests cover production and preview origins.
  const canonicalInBuild = readFileSync(".next/server/app/index.html","utf8").match(/<link[^>]*rel="canonical"[^>]*href="([^"]+)"/)?.[1];
  expect(canonicalInBuild).toBeTruthy();
  const canonicalOrigin = new URL(canonicalInBuild!).origin;
  const paths = [...routes, "/services/design/web-design", "/services/growth/seo"];
  const titles = new Set<string>();
  for (const path of paths) {
    await page.goto(path);
    const title = await page.title();
    expect(titles.has(title)).toBe(false); titles.add(title);
    expect(new URL((await page.locator('link[rel="canonical"]').getAttribute("href"))!).href).toBe(canonicalOrigin + (path === "/" ? "/" : path));
    await expect(page.locator('meta[property="og:locale"]')).toHaveAttribute("content", "fa_IR");
    await expect(page.locator('meta[name="twitter:card"]')).toHaveAttribute("content", "summary_large_image");
    const graph = await page.locator('script[type="application/ld+json"]').evaluate(element => JSON.parse(element.textContent || "{}"));
    expect(graph["@context"]).toBe("https://schema.org");
    expect(graph["@graph"].some((node: Record<string, unknown>) => node["@type"] === "WebSite")).toBe(true);
    if (path.startsWith("/services/") && path.split("/").length > 3) {
      const faq = graph["@graph"].find((node: Record<string, unknown>) => node["@type"] === "FAQPage");
      expect(faq.mainEntity).toHaveLength(await page.locator("#faq details").count());
      expect(graph["@graph"].some((node: Record<string, unknown>) => node["@type"] === "Service")).toBe(true);
    }
  }
  await page.goto("/admin/login");
  await expect(page.locator('script[type="application/ld+json"]')).toHaveCount(0);
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/);
});
test("localized homepage follows the source order and works without JavaScript", async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 390, height: 844 }, locale: "fa-IR" });
  try {
    const page = await context.newPage();
    await page.goto(origin);
    const sections = await page.locator("main > section").evaluateAll(nodes => nodes.map(node => node.id));
    expect(sections).toEqual(["top", "services", "ai-solutions", "consultation", "process", "faq", "contact"]);
    await expect(page.getByRole("form", { name: "فرم مشاوره رایگان" })).toHaveCount(1);
    await expect(page.locator("#ai-solutions article")).toHaveCount(6);
    await expect(page.locator("#process li")).toHaveCount(4);
    const questions = page.locator("#faq details");
    await expect(questions).toHaveCount(6);
    await questions.first().locator("summary").click();
    await expect(questions.first().locator("p")).toBeVisible();
    const graph = JSON.parse((await page.locator('script[type="application/ld+json"]').textContent())!);
    const faq = graph["@graph"].find((item: Record<string, unknown>) => item["@type"] === "FAQPage");
    expect(faq.mainEntity.map((item: { name: string }) => item.name)).toEqual(await questions.locator("summary").allTextContents());
    const geometry = await page.locator("main").boundingBox();
    // More visible editorial copy is intentional; retain a bounded mobile layout.
    expect(geometry!.height).toBeLessThan(7200);
    await expect(page.locator("#ai-solutions article").last()).toBeHidden();
    await page.locator("#ai-solutions details summary").click();
    await expect(page.locator("#ai-solutions article").last()).toBeVisible();
    await page.locator("#ai-solutions details summary").click();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.screenshot({ path: "artifacts/home-localized-mobile.png", fullPage: true });
  } finally { await context.close(); }
});

test("service navigation supports keyboard, direct links and mobile categories", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/");
  const disclosure = page.locator(".service-disclosure");
  const trigger = disclosure.locator("summary");
  await trigger.focus(); await page.keyboard.press("Enter");
  await expect(page.locator(".mega-menu")).toBeVisible();
  await expect(page.locator(".mega-menu-groups")).toHaveCount(1);
  await page.keyboard.press("Escape");
  await expect(disclosure).not.toHaveAttribute("open", "");
  await expect(trigger).toBeFocused();
  await trigger.click();
  await page.locator('.mega-menu a[href="/services/development/web-development"]').click();
  await expect(page).toHaveURL(/services\/development\/web-development$/);
  await page.setViewportSize({ width: 320, height: 900 });
  await page.getByRole("button", { name: "باز کردن منو" }).click();
  const menu=page.getByRole("dialog", { name: "منوی اصلی" });
  await expect(menu.locator(".mobile-services")).toHaveAttribute("open", "");
  await menu.locator(".mobile-services > details").first().locator("summary").click();
  await menu.locator('a[href="/services/development/ai-automation"]').click();
  await expect(menu).not.toBeVisible();
  await expect(page).toHaveURL(/services\/development\/ai-automation$/);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
});

test("service search has no-results, clear and noindex states", async ({ page }) => {
  await page.goto("/services");
  const form=page.getByRole("search");
  await form.getByLabel("دنبال چه راهکاری هستید؟").fill("رزرو");
  await form.getByRole("button", { name: "جست‌وجوی خدمات" }).click();
  await expect(page).toHaveURL(/\/services\/search\?q=.*#catalog$/);
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/);
  await expect(page.locator('#catalog a[href="/services/development/web-development/booking-system-development"]')).toBeVisible();
  await page.getByRole("link", { name: "پاک کردن جست‌وجو" }).click();
  await expect(page.locator("#service-search")).toHaveValue("");
  await page.getByRole("search").getByLabel("دنبال چه راهکاری هستید؟").fill("zzzz-no-service");
  await page.getByRole("button", { name: "جست‌وجوی خدمات" }).click();
  await expect(page.getByText("نتیجه‌ای پیدا نشد.", { exact: false })).toBeVisible();
});

test("deep service, pricing and public navigation pages stay accessible on small phones", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 900 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  for(const path of ["/services/development/web-development/booking-system-development","/services/design/ui-designs/design-systems","/services/growth/seo/technical-seo","/pricing","/blog","/live-case-studies"]){
    const response=await page.goto(path);
    expect(response?.status()).toBe(200);
    await expect(page.locator("h1")).toHaveCount(1);
    expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),path).toBe(true);
    const a11y=await new AxeBuilder({page}).withTags(["wcag2a","wcag2aa","wcag21aa"]).analyze();
    expect(a11y.violations.map(item=>({id:item.id,impact:item.impact})),path).toEqual([]);
  }
});

test("breadcrumbs clear the navbar, precede the hero and scroll horizontally on phones", async ({ page }) => {
  const path="/services/development/web-development/booking-system-development";
  for(const width of [1440,768,320]) {
    await page.setViewportSize({width,height:900});
    await page.goto(path);
    const trail=page.getByRole("navigation",{name:"مسیر صفحه",exact:true});
    await expect(trail).toBeVisible();
    await expect(trail.locator('[aria-current="page"]')).toHaveText("توسعه سامانه رزرو");
    const box=await trail.boundingBox(),header=await page.locator(".nav-shell").boundingBox(),hero=await page.locator(".hero-stage").boundingBox();
    expect(box!.y).toBeGreaterThanOrEqual(header!.y+header!.height+6);
    expect(box!.y+box!.height).toBeLessThanOrEqual(hero!.y);
    expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
    if(width===320) {
      const geometry=await trail.evaluate(node=>({scroll:node.scrollWidth,client:node.clientWidth,bar:getComputedStyle(node).scrollbarWidth,height:node.getBoundingClientRect().height}));
      expect(geometry.scroll).toBeGreaterThan(geometry.client);
      expect(geometry.bar).toBe("none");
      expect(geometry.height).toBeLessThan(60);
      await trail.focus();
      await page.keyboard.press("End");
      await trail.locator('[aria-current="page"]').evaluate(node=>node.scrollIntoView({block:"nearest",inline:"end"}));
      const current=await trail.locator('[aria-current="page"]').boundingBox();
      expect(current!.x).toBeGreaterThanOrEqual(box!.x-1);
      expect(current!.x+current!.width).toBeLessThanOrEqual(box!.x+box!.width+1);
    }
  }
});

test("service cards have bounded lazy images and service-specific headings", async ({ page }) => {
  await page.setViewportSize({width:390,height:844});
  await page.goto("/services/design/web-design");
  await expect(page.locator(".hero-image")).toHaveAttribute("fetchpriority","high");
  await expect(page.locator(".hero-image")).toHaveAttribute("loading","eager");
  expect(await page.locator(".hero-image").evaluate((node:HTMLImageElement)=>node.currentSrc)).toContain("-mobile.png");
  await expect(page.getByRole("heading",{level:2,name:"طراحی سایت؛ از نیاز تا اجرا",exact:true})).toBeVisible();
  const images=page.locator("main .feature-card .card-visual img");
  expect(await images.count()).toBeGreaterThan(3);
  for(const image of await images.all()) {
    await expect(image).toHaveAttribute("loading","lazy");
    expect(await image.getAttribute("sizes")).toBeTruthy();
    expect(await image.evaluate(node=>node.getBoundingClientRect().height)).toBeGreaterThan(0);
  }
  await images.first().scrollIntoViewIfNeeded();
  await expect.poll(()=>images.first().evaluate((node:HTMLImageElement)=>node.complete&&node.naturalWidth>0)).toBe(true);
  const foreground = images.first();
  const artwork = await foreground.evaluate(node => {
    const image = node as HTMLImageElement;
    const style = getComputedStyle(image);
    return { url: image.currentSrc, mask: style.maskImage, blend: style.mixBlendMode, filter: style.filter };
  });
  expect(new URL(artwork.url).searchParams.get("url")).toMatch(/\/images\/services\/.+\.png$/);
  expect(artwork.mask).toBe("none");
  expect(artwork.blend).toBe("normal");
  expect(artwork.filter).toBe("none");
  const delivered = await page.request.get(artwork.url, { headers: { Accept: "image/webp" } });
  expect(delivered.ok()).toBe(true);
  const optimized = sharp(await delivered.body());
  expect((await optimized.metadata()).hasAlpha).toBe(true);
  expect((await optimized.extract({ left: 0, top: 0, width: 1, height: 1 }).raw().toBuffer())[3]).toBe(0);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
});

test("reference cards share their frame and keep subservice controls independent", async ({ page }) => {
  await page.setViewportSize({width:390,height:844});
  await page.goto("/services/development");
  const card=page.locator("#catalog .feature-card").filter({has:page.getByRole("heading",{name:"توسعه اپلیکیشن",exact:true})});
  await card.scrollIntoViewIfNeeded();
  await expect(card.locator(".feature-card-panel")).toBeVisible();
  await expect(card.locator(".feature-art-wave")).toHaveCount(2);
  expect(await card.evaluate(node=>getComputedStyle(node).backdropFilter)).toBe("none");
  const disclosure=card.locator("details");
  await disclosure.locator("summary").click();
  await expect(disclosure).toHaveAttribute("open","");
  await expect(page).toHaveURL(/\/services\/development$/);
  const child=disclosure.locator('a[href="/services/development/app-development/mobile-app-development"]');
  await child.click();
  await expect(page).toHaveURL(/\/services\/development\/app-development\/mobile-app-development$/);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
});

test("mobile card rails allow keyboard access and desktop cards remain a grid", async ({ page }) => {
  await page.setViewportSize({width:320,height:900});
  await page.goto("/");
  const rail=page.locator("#services .card-grid--rail");
  expect(await rail.evaluate(node=>node.scrollWidth>node.clientWidth)).toBe(true);
  await rail.focus();
  await page.keyboard.press("ArrowLeft");
  const finalCard=rail.locator(".feature-card").last();
  await finalCard.locator(".feature-card-cover-link").focus();
  const bounds=await finalCard.boundingBox(),view=await rail.boundingBox();
  expect(bounds!.x).toBeGreaterThanOrEqual(view!.x-1);
  expect(bounds!.x+bounds!.width).toBeLessThanOrEqual(view!.x+view!.width+1);
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/\/services\/development\/ai-automation$/);
  await page.setViewportSize({width:1440,height:1000});
  await page.goto("/");
  expect(await page.locator("#services .card-grid").evaluate(node=>node.scrollWidth<=node.clientWidth+1)).toBe(true);
});

test("neon hero decoration stays static, bounded and independent of image loading", async ({ page }) => {
  await page.emulateMedia({reducedMotion:"reduce"});
  for(const width of [320,390,1440]) {
    await page.setViewportSize({width,height:900});
    await page.goto("/");
    const hero=page.locator(".hero-stage");
    await expect(hero.locator(".hero-backdrop")).toBeVisible();
    await expect(hero.locator(".hero-light-floor")).toHaveCount(1);
    await expect(hero.locator(".hero-light-orbits")).toHaveCount(1);
    expect(await hero.locator(".hero-backdrop *").count()).toBeLessThan(65);
    expect(await hero.locator(".hero-backdrop :is(img,canvas,video)").count()).toBe(0);
    expect(await hero.locator(".hero-backdrop *").evaluateAll(nodes=>nodes.every(node=>getComputedStyle(node).animationName==="none"))).toBe(true);
    const scenery=await hero.locator(".hero-backdrop").boundingBox();
    expect(scenery!.x).toBeGreaterThanOrEqual(0);
    expect(scenery!.x+scenery!.width).toBeLessThanOrEqual(width);
    await expect(hero.locator(".hero-image")).toHaveAttribute("fetchpriority","high");
    await expect(hero.locator(".hero-image")).toHaveAttribute("loading","eager");
    expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  }
});

test("desktop menu keeps four columns together and supports quick keyboard access", async ({ page }) => {
  await page.goto("/");
  const disclosure = page.locator(".service-disclosure");
  const trigger = page.locator(".service-disclosure-trigger");
  const menu = page.locator(".service-mega-menu");
  for (const width of [1200, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await trigger.click();
    const columns = await menu.locator(".service-menu-columns > *").evaluateAll(nodes => nodes.map(node => {
      const box = node.getBoundingClientRect();
      return { top: box.top, left: box.left, right: box.right };
    }));
    expect(columns).toHaveLength(4);
    expect(Math.max(...columns.map(box => box.top)) - Math.min(...columns.map(box => box.top))).toBeLessThan(1);
    expect(columns.every(box => box.left >= 0 && box.right <= width)).toBe(true);
    await page.keyboard.press("Escape");
    await expect(disclosure).not.toHaveAttribute("open", "");
    await expect(trigger).toBeFocused();
  }
  await page.keyboard.press("Control+k");
  await expect(menu.locator(".service-menu-group").first()).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/\/services\/development$/);
  await expect(disclosure).not.toHaveAttribute("open", "");
});

test("mobile menu remains usable in a short viewport and releases its scroll lock", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 568 });
  await page.goto("/");
  const trigger = page.getByRole("button", { name: "باز کردن منو", exact: true });
  const menu = page.getByRole("dialog", { name: "منوی اصلی", exact: true });
  await trigger.click();
  await expect(menu.locator(".mobile-services")).toHaveAttribute("open", "");
  await expect(menu.locator(".mobile-service-group")).toHaveCount(3);
  await menu.locator(".mobile-service-group > summary").first().click();
  const contact = menu.locator('nav a[href="/contact"]');
  await contact.scrollIntoViewIfNeeded();
  await expect(contact).toBeInViewport();
  await expect(menu.getByRole("button", { name: "بستن منو" })).toBeInViewport();
  expect(await menu.evaluate(node => node.scrollWidth <= node.clientWidth)).toBe(true);
  await page.keyboard.press("Escape");
  await expect(menu).not.toBeVisible();
  await expect(trigger).toBeFocused();
  expect(await page.evaluate(() => document.body.style.overflow)).toBe("");
  await trigger.click();
  await page.setViewportSize({ width: 1440, height: 900 });
  await expect(menu).not.toBeVisible();
  expect(await page.evaluate(() => document.body.style.overflow)).toBe("");
});

test("menu artwork loads on demand without service prefetch or continuous effects", async ({ page }) => {
  const imageRequests: string[] = [], routePrefetches: string[] = [];
  page.on("request", request => {
    const url = new URL(request.url());
    if ((url.searchParams.get("url") || url.pathname).startsWith("/images/services/")) imageRequests.push(request.url());
    if (url.pathname.startsWith("/services/") && (request.headers()["next-router-prefetch"] || url.searchParams.has("_rsc"))) routePrefetches.push(request.url());
  });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/menu-artwork-review-not-found");
  await page.evaluate(() => document.fonts.ready);
  expect(imageRequests).toHaveLength(0);
  await page.locator(".service-disclosure-trigger").click();
  const menu = page.locator(".service-mega-menu");
  await expect.poll(() => menu.locator("img").evaluateAll(nodes => nodes.every(image => image instanceof HTMLImageElement && image.complete && image.naturalWidth > 0))).toBe(true);
  expect(new Set(imageRequests).size).toBe(3);
  expect(await menu.evaluate(node => getComputedStyle(node).backdropFilter)).toBe("none");
  expect(await menu.locator("*").evaluateAll(nodes => nodes.every(node => getComputedStyle(node).animationName === "none"))).toBe(true);
  await menu.locator(".service-menu-link").first().hover();
  await page.waitForTimeout(200);
  expect(routePrefetches).toEqual([]);
});
