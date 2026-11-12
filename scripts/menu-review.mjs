import { spawn } from "node:child_process";
import { mkdir, writeFile } from "node:fs/promises";
import assert from "node:assert/strict";
import { chromium } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const origin = "http://127.0.0.1:3192";
const server = spawn(process.execPath, ["node_modules/next/dist/bin/next", "start", "-p", "3192", "-H", "127.0.0.1"], {
  stdio: ["ignore", "pipe", "pipe"], env: { ...process.env, SITE_INDEXABLE: "false" },
});
let logs = "", browser;
server.stdout.on("data", value => logs += value);
server.stderr.on("data", value => logs += value);
const cases = [], screenshots = [], errors = [];
try {
  let ready = false;
  for (let attempt = 0; attempt < 80; attempt++) {
    try { if ((await fetch(origin)).ok) { ready = true; break; } } catch {}
    await new Promise(resolve => setTimeout(resolve, 250));
  }
  assert(ready, logs);
  await mkdir("artifacts", { recursive: true });
  browser = await chromium.launch({ channel: process.env.PLAYWRIGHT_CHANNEL || "chrome", headless: true });
  for (const size of [
    { width: 1440, height: 1000 }, { width: 1200, height: 800 },
    { width: 1280, height: 600 }, { width: 1024, height: 768 },
    { width: 390, height: 844 }, { width: 320, height: 568 },
  ]) {
    const context = await browser.newContext({ viewport: size, locale: "fa-IR", reducedMotion: "reduce", serviceWorkers: "block" });
    const page = await context.newPage();
    page.on("pageerror", error => errors.push(error.message));
    await page.goto(origin);
    await page.evaluate(() => document.fonts.ready);
    const desktop = size.width >= 1200;
    await page.locator(desktop ? ".service-disclosure-trigger" : ".mobile-menu-trigger").click();
    const menu = page.locator(desktop ? ".service-mega-menu" : ".service-mobile-menu");
    await menu.locator("img").first().waitFor({ state: "visible" });
    await page.waitForFunction(selector => [...document.querySelectorAll(`${selector} img`)].every(image => image.complete && image.naturalWidth > 0), desktop ? ".service-mega-menu" : ".service-mobile-menu");
    const geometry = await menu.evaluate(node => {
      const box = node.getBoundingClientRect(), css = getComputedStyle(node);
      return {
        x: box.x, y: box.y, width: box.width, height: box.height,
        withinViewport: box.x >= 0 && box.right <= innerWidth && box.y >= 0 && box.bottom <= innerHeight,
        documentOverflow: document.documentElement.scrollWidth > innerWidth,
        menuOverflow: node.scrollWidth > node.clientWidth,
        scrollable: node.scrollHeight > node.clientHeight, blur: css.backdropFilter,
        animatedElements: [...node.querySelectorAll("*")].filter(child => getComputedStyle(child).animationName !== "none").length,
        columns: [...node.querySelectorAll(".service-menu-columns > *")].map(child => Math.round(child.getBoundingClientRect().top)),
        imageBytes: performance.getEntriesByType("resource").filter(entry => [...node.querySelectorAll("img")].some(image => image.currentSrc === entry.name)).reduce((sum, entry) => sum + entry.encodedBodySize, 0),
      };
    });
    assert(geometry.withinViewport && !geometry.documentOverflow && !geometry.menuOverflow, JSON.stringify({ size, geometry }));
    assert.equal(geometry.blur, "none");
    assert.equal(geometry.animatedElements, 0);
    if (desktop) { assert.equal(geometry.columns.length, 4); assert.equal(new Set(geometry.columns).size, 1); }
    const report = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa"]).analyze();
    assert.deepEqual(report.violations.map(item => ({ id: item.id, nodes: item.nodes.map(node => node.target) })), [], `Menu accessibility at ${size.width}`);
    const filename = `artifacts/mega-menu-${size.width}x${size.height}.png`;
    await page.screenshot({ path: filename }); screenshots.push(filename);
    if (!desktop) {
      await menu.locator(".mobile-service-group > summary").first().click();
      await menu.locator('nav a[href="/contact"]').scrollIntoViewIfNeeded();
      assert(await menu.getByRole("button", { name: "بستن منو" }).isVisible());
      await page.screenshot({ path: filename.replace(".png", "-expanded.png") });
      screenshots.push(filename.replace(".png", "-expanded.png"));
    }
    await page.keyboard.press("Escape");
    assert.equal(await menu.isVisible(), false);
    assert.equal(await page.evaluate(() => document.body.style.overflow), "");
    cases.push({ viewport: size, desktop, menu: geometry, accessibilityViolations: 0 });
    await context.close();
  }
  const weakContext = await browser.newContext({ viewport: { width: 390, height: 844 }, serviceWorkers: "block" });
  await weakContext.addInitScript(() => {
    Object.defineProperty(navigator, "hardwareConcurrency", { configurable: true, get: () => 2 });
    Object.defineProperty(navigator, "deviceMemory", { configurable: true, get: () => 2 });
  });
  const weakPage = await weakContext.newPage();
  await weakPage.goto(origin);
  await weakPage.waitForFunction(() => document.documentElement.dataset.performance === "reduced");
  await weakPage.locator(".mobile-menu-trigger").click();
  const fallback = await weakPage.locator(".service-mobile-menu").evaluate(node => ({ mode: document.documentElement.dataset.performance, blur: getComputedStyle(node).backdropFilter, animatedElements: [...node.querySelectorAll("*")].filter(child => getComputedStyle(child).animationName !== "none").length }));
  assert.equal(fallback.blur, "none"); assert.equal(fallback.animatedElements, 0);
  await weakContext.close();
  assert.deepEqual(errors, []);
  const result = { passed: true, cases, screenshots, fallback, pageErrors: errors, limits: "Local Chrome checks with reduced motion and a simulated constrained-device capability fallback; physical devices were not profiled." };
  await writeFile("artifacts/menu-design-review.json", JSON.stringify(result, null, 2));
  console.log(JSON.stringify(result, null, 2));
} finally {
  await browser?.close(); server.kill("SIGTERM");
}
