import { readFileSync } from "node:fs";
import { test, expect, type BrowserContext } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const route = "/services/growth/social-media-marketing";
const source = JSON.parse(readFileSync("content/services.fa.json", "utf8")).pages.find((page: { path: string }) => page.path === route);

declare global {
  interface Window { serviceEntries: { className: string; properties: string[] }[] }
}

async function instrument(context: BrowserContext, cpu = 8, memory = 8, saveData = false) {
  await context.addInitScript(({ cpu, memory, saveData }) => {
    Object.defineProperty(navigator, "hardwareConcurrency", { get: () => cpu });
    Object.defineProperty(navigator, "deviceMemory", { get: () => memory });
    Object.defineProperty(navigator, "connection", { get: () => Object.assign(new EventTarget(), { saveData }) });
    window.serviceEntries = [];
    const animate = HTMLElement.prototype.animate;
    HTMLElement.prototype.animate = function (frames, options) {
      if (this.closest("[data-service-page]")) window.serviceEntries.push({ className: this.className, properties: Object.keys((frames as Keyframe[])[0]) });
      return animate.call(this, frames, options);
    };
  }, { cpu, memory, saveData });
}

test("workflow stays readable in order without JavaScript on desktop and small phones", async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false, reducedMotion: "reduce", viewport: { width: 1440, height: 1000 }, serviceWorkers: "block" });
  const page = await context.newPage();
  try {
    for (const width of [1440, 1024, 768, 390, 320]) {
      await page.setViewportSize({ width, height: 1000 });
      await page.goto("http://127.0.0.1:3196" + route + "#process");
      await page.evaluate(() => document.fonts.ready);
      const section = page.locator("#process");
      await expect(section.locator("h2")).toHaveText("مراحل " + source.title + ".");
      await expect(section.locator(".workflow-copy p")).toHaveText(source.process);
      await section.locator(".workflow-icon").evaluateAll(images => Promise.all(images.map(image => (image as HTMLImageElement).decode())));
      const geometry = await section.evaluate(node => {
        const cards = [...node.querySelectorAll<HTMLElement>(".workflow-card")].map(card => {
          const box = card.getBoundingClientRect(), icon = card.querySelector("img")!.getBoundingClientRect(), copy = card.querySelector("p")!.getBoundingClientRect();
          const step = card.parentElement!, dot = step.querySelector(".workflow-node")!.getBoundingClientRect();
          return { x: box.x, right: box.right, y: box.y, bottom: box.bottom, iconRight: icon.right, copyLeft: copy.left, dotX: dot.x + dot.width / 2, opacity: getComputedStyle(card).opacity, filter: getComputedStyle(card).backdropFilter };
        });
        return { overflow: document.documentElement.scrollWidth > innerWidth, cards, listItems: node.querySelector("ol")!.children.length, sceneAnimations: node.querySelector(".workflow-scene")!.getAnimations({ subtree: true }).length };
      });
      expect(geometry.overflow).toBe(false);
      expect(geometry.listItems).toBe(4);
      expect(geometry.sceneAnimations).toBe(0);
      for (const [index, card] of geometry.cards.entries()) {
        expect(card.opacity).toBe("1");
        expect(card.filter).toBe("none");
        if (width < 1024) {
          expect(card.iconRight).toBeLessThanOrEqual(card.copyLeft);
          expect(card.dotX).toBeGreaterThan(card.right);
          if (index) expect(card.y).toBeGreaterThan(geometry.cards[index - 1].bottom);
        } else if (index) {
          expect(card.x).toBeLessThan(geometry.cards[index - 1].x);
          expect(card.y - geometry.cards[index - 1].y).toBeGreaterThan(24);
        }
      }
      if ([1440, 390].includes(width)) await section.screenshot({ path: `artifacts/service-workflow-${width}.png` });
    }
  } finally { await context.close(); }
});

test("service entries animate once, finish visible and respond to reduced motion", async ({ context, page }) => {
  await instrument(context);
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto(route);
  await expect(page.locator("[data-service-page]")).toHaveAttribute("data-entrance", "enabled");
  await page.evaluate(() => document.getElementById("process")!.scrollIntoView({ behavior: "instant" }));
  await expect.poll(() => page.evaluate(() => window.serviceEntries.filter(item => item.className.includes("workflow-step")).length)).toBe(4);
  await expect.poll(() => page.locator("#process").evaluate(node => node.getAnimations({ subtree: true }).length)).toBe(0);
  for (const item of await page.locator(".workflow-step").all()) {
    expect(await item.evaluate(node => ({ opacity: getComputedStyle(node).opacity, transform: getComputedStyle(node).transform, willChange: getComputedStyle(node).willChange }))).toEqual({ opacity: "1", transform: "none", willChange: "auto" });
  }
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
  await page.evaluate(() => document.getElementById("process")!.scrollIntoView({ behavior: "instant" }));
  expect(await page.evaluate(() => window.serviceEntries.filter(item => item.className.includes("workflow-step")).length)).toBe(4);
  expect(await page.evaluate(() => window.serviceEntries.every(item => item.properties.length === 2 && item.properties.includes("opacity") && item.properties.includes("transform")))).toBe(true);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(page.locator("[data-service-page]")).toHaveAttribute("data-entrance", "static");
  await expect.poll(() => page.locator("#process").evaluate(node => node.getAnimations({ subtree: true }).length)).toBe(0);
  const report = await new AxeBuilder({ page }).include("#process").withTags(["wcag2a", "wcag2aa", "wcag21aa"]).analyze();
  expect(report.violations).toEqual([]);
  // The same enhancement belongs to the catalog, without changing its server search.
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("/services");
  await expect(page.locator("[data-service-page]")).toHaveAttribute("data-entrance", "enabled");
  await page.locator("#overview").scrollIntoViewIfNeeded();
  await expect.poll(() => page.evaluate(() => window.serviceEntries.length)).toBeGreaterThan(0);
});

test("reduced motion, low CPU, low memory and Save-Data keep service content static", async ({ browser }) => {
  for (const policy of [{ cpu: 8, memory: 8, saveData: false, reduce: true }, { cpu: 2, memory: 8, saveData: false }, { cpu: 8, memory: 2, saveData: false }, { cpu: 8, memory: 8, saveData: true }]) {
    const context = await browser.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, reducedMotion: policy.reduce ? "reduce" : "no-preference", serviceWorkers: "block" });
    try {
      await instrument(context, policy.cpu, policy.memory, policy.saveData);
      const page = await context.newPage();
      await page.goto("http://127.0.0.1:3196" + route + "#process");
      await expect(page.locator("[data-service-page]")).toHaveAttribute("data-entrance", "static");
      await expect(page.locator("html")).toHaveAttribute("data-scroll-mode", "native");
      expect(await page.evaluate(() => window.serviceEntries)).toEqual([]);
      await expect(page.locator(".workflow-copy p")).toHaveText(source.process);
      for (const item of await page.locator(".workflow-step").all()) expect(await item.evaluate(node => getComputedStyle(node).opacity)).toBe("1");
      if (!policy.reduce) expect(await page.locator(".workflow-card").first().evaluate(node => getComputedStyle(node).boxShadow)).toBe("none");
    } finally { await context.close(); }
  }
});
