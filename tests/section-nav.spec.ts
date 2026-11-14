import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

async function expectClearTarget(page: Page, id: string) {
  await expect.poll(() => page.evaluate(target => {
    const dock = document.querySelector(".page-section-nav")!.getBoundingClientRect();
    const section = document.getElementById(target)!.getBoundingClientRect();
    return Math.round(section.top - dock.bottom);
  }, id)).toBe(16);
}

test("desktop section links stay below the navbar and reveal their targets", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  for (const width of [1440, 1024]) {
    await page.setViewportSize({ width, height: 900 });
    for (const route of [
      "/services/development/web-development",
      "/services/development/web-development/booking-system-development",
    ]) {
      await page.goto(route);
      await page.evaluate(() => document.fonts.ready);
      const dock = page.getByRole("navigation", { name: "دسترسی سریع این صفحه", exact: true });
      const links = dock.getByRole("link");
      const targets = await links.evaluateAll(nodes => nodes.map(node => node.getAttribute("href")!.slice(1)));
      expect(targets).toHaveLength(4);
      const scrollY = await dock.evaluate(node => node.getBoundingClientRect().top + window.scrollY + 200);
      await page.evaluate(top => window.scrollTo({ top, behavior: "instant" }), scrollY);
      await expect.poll(() => page.evaluate(() => {
        const header = document.querySelector(".nav-shell")!.getBoundingClientRect();
        return Math.round(document.querySelector(".page-section-nav")!.getBoundingClientRect().top - header.bottom);
      })).toBe(12);
      for (const id of targets) {
        await dock.locator(`a[href="#${id}"]`).click();
        await expect(page).toHaveURL(new RegExp(`#${id}$`));
        await expectClearTarget(page, id);
      }
      const process = dock.locator('a[href="#process"]');
      await process.focus();
      await page.keyboard.press("Tab");
      await page.keyboard.press("Shift+Tab");
      await expect(process).toBeFocused();
      expect(await process.evaluate(node => getComputedStyle(node).outlineStyle)).toBe("solid");
      await process.press("Enter");
      await expectClearTarget(page, "process");
      expect(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)).toBe(false);
    }
  }
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.locator('.page-section-nav a[href="#deliverables"]').click();
  await expectClearTarget(page, "deliverables");
  const accessibility = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa"]).analyze();
  expect(accessibility.violations).toEqual([]);
  await page.screenshot({ path: "artifacts/section-nav-desktop.png" });
  // The main disclosure must still render and receive clicks above the dock.
  await page.locator(".service-disclosure-trigger").click();
  await expect(page.locator(".service-mega-menu")).toBeVisible();
  const group = page.locator(".service-menu-group").first();
  expect(await group.evaluate(node => {
    const box = node.getBoundingClientRect();
    return node.contains(document.elementFromPoint(box.x + box.width / 2, box.y + box.height / 2));
  })).toBe(true);
});

test("mobile section links stay in one sticky scrollable row and work without JavaScript", async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false, hasTouch: true, viewport: { width: 1280, height: 600 }, reducedMotion: "reduce" });
  const page = await context.newPage();
  try {
    await page.goto("http://127.0.0.1:3196/services/development/web-development#deliverables");
    await expectClearTarget(page, "deliverables");
    const dock = page.getByRole("navigation", { name: "دسترسی سریع این صفحه", exact: true });
    await dock.locator('a[href="#process"]').click();
    await expectClearTarget(page, "process");
    for (const width of [390, 320, 768]) {
      await page.setViewportSize({ width, height: 700 });
      // Let responsive layout settle before a same-document fragment navigation.
      // Otherwise Chrome can resolve the anchor using the preceding viewport.
      await page.evaluate(() => document.fonts.ready);
      await expect(dock.locator(".section-nav-shell")).toHaveCSS("height", "72px");
      await expect(page.locator("#catalog .card-grid").first()).toHaveCSS("display", width < 768 ? "flex" : "grid");
      await page.goto("http://127.0.0.1:3196/services/development/web-development#deliverables");
      await expectClearTarget(page, "deliverables");
      const rail = dock.locator(".section-nav-links");
      const geometry = await rail.evaluate(node => ({
        width: node.clientWidth,
        content: node.scrollWidth,
        rows: new Set([...node.querySelectorAll("a")].map(link => Math.round(link.getBoundingClientRect().top))).size,
      }));
      expect(geometry.rows).toBe(1);
      if (width < 400) expect(geometry.content).toBeGreaterThan(geometry.width);
      expect(await dock.evaluate(node => node.getBoundingClientRect().height)).toBeLessThanOrEqual(72);
      await expect.poll(() => page.evaluate(() => {
        const header = document.querySelector(".nav-shell")!.getBoundingClientRect();
        return Math.round(document.querySelector(".page-section-nav")!.getBoundingClientRect().top - header.bottom);
      })).toBe(8);
      for (const link of await dock.getByRole("link").all()) {
        expect((await link.boundingBox())!.height).toBeGreaterThanOrEqual(44);
        const id = (await link.getAttribute("href"))!.slice(1);
        await link.tap();
        await expectClearTarget(page, id);
      }
      await dock.getByRole("link").first().focus();
      for (let index = 0; index < 3; index++) await page.keyboard.press("Tab");
      const last = dock.getByRole("link").last();
      await expect(last).toBeFocused();
      const railBox = (await rail.boundingBox())!, linkBox = (await last.boundingBox())!;
      expect(linkBox.x).toBeGreaterThanOrEqual(railBox.x);
      expect(linkBox.x + linkBox.width).toBeLessThanOrEqual(railBox.x + railBox.width);
      await last.press("Enter");
      await expectClearTarget(page, "faq");
      if (width === 390) await page.screenshot({ path: "artifacts/section-nav-mobile.png" });
      expect(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)).toBe(false);
    }
  } finally {
    await context.close();
  }
});
