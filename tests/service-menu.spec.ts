import { test, expect, type BrowserContext } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

declare global { interface Window { menuTransitions: { duration: number; properties: string[] }[] } }

async function instrument(context: BrowserContext, weak = false) {
  await context.addInitScript(weak => {
    Object.defineProperty(navigator, "hardwareConcurrency", { get: () => weak ? 2 : 8 });
    Object.defineProperty(navigator, "deviceMemory", { get: () => weak ? 2 : 8 });
    window.menuTransitions = [];
    const animate = HTMLElement.prototype.animate;
    HTMLElement.prototype.animate = function (frames, options) {
      if (this.matches(".service-mega-menu")) window.menuTransitions.push({ duration: Number((options as KeyframeAnimationOptions).duration), properties: Object.keys((frames as Keyframe[])[0]) });
      return animate.call(this, frames, options);
    };
  }, weak);
}

test("desktop hover opens smoothly, permits gap travel and dismisses without taking focus", async ({ context, page }) => {
  await instrument(context);
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("/");
  const disclosure = page.locator(".service-disclosure"), trigger = disclosure.locator("summary"), menu = page.locator(".service-mega-menu");
  await trigger.hover();
  await expect(disclosure).toHaveAttribute("open", "");
  const bridge = await page.locator(".service-menu-bridge").boundingBox();
  await page.mouse.move(bridge!.x + bridge!.width / 2, bridge!.y + bridge!.height / 2);
  await menu.locator(".service-menu-group").first().hover();
  await expect(disclosure).toHaveAttribute("open", "");
  await expect.poll(() => menu.evaluate(node => node.getAnimations().length)).toBe(0);
  const report = await new AxeBuilder({ page }).include(".site-header").withTags(["wcag2a", "wcag2aa", "wcag21aa"]).analyze();
  expect(report.violations).toEqual([]);
  await page.keyboard.press("Escape");
  await expect(disclosure).not.toHaveAttribute("open", "");
  expect(await trigger.evaluate(node => node === document.activeElement)).toBe(false);
  await trigger.hover();
  await expect(disclosure).toHaveAttribute("open", "");
  await page.mouse.move(30, 800);
  await expect(disclosure).not.toHaveAttribute("open", "");
  const transitions = await page.evaluate(() => window.menuTransitions);
  expect(transitions.some(item => item.duration === 180)).toBe(true);
  expect(transitions.some(item => item.duration === 140)).toBe(true);
  expect(transitions.every(item => item.properties.length === 2 && item.properties.includes("opacity") && item.properties.includes("transform"))).toBe(true);
  expect(await menu.evaluate(node => node.getAnimations().length)).toBe(0);
});

test("click, keyboard focus and rapid toggles keep desktop services usable", async ({ context, page }) => {
  await instrument(context);
  await page.goto("/");
  const disclosure = page.locator(".service-disclosure"), trigger = disclosure.locator("summary"), menu = page.locator(".service-mega-menu");
  await trigger.hover(); await expect(disclosure).toHaveAttribute("open", "");
  await trigger.click(); // Pin the hover-open disclosure.
  await page.mouse.move(30, 800);
  await expect(disclosure).toHaveAttribute("open", "");
  await trigger.click(); await expect(disclosure).not.toHaveAttribute("open", "");
  await page.mouse.move(30, 800);
  await trigger.focus(); await trigger.press("Enter");
  const first = menu.locator(".service-menu-group").first();
  await first.focus();
  await page.mouse.move(30, 800);
  await expect(first).toBeFocused();
  await expect(disclosure).toHaveAttribute("open", "");
  await first.press("Escape");
  await expect(disclosure).not.toHaveAttribute("open", "");
  await expect(trigger).toBeFocused();
  await trigger.press("Space"); await trigger.press("Space"); await trigger.press("Space");
  await expect(disclosure).toHaveAttribute("open", "");
  await expect.poll(() => menu.evaluate(node => node.getAnimations().length)).toBe(0);
  expect(await menu.evaluate(node => ({ opacity: getComputedStyle(node).opacity, inert: (node as HTMLElement).inert }))).toEqual({ opacity: "1", inert: false });
  await page.mouse.click(30, 800);
  await expect(disclosure).not.toHaveAttribute("open", "");
});

test("reduced motion and weak hardware keep hover navigation immediate", async ({ browser }) => {
  for (const weak of [false, true]) {
    const context = await browser.newContext({ reducedMotion: weak ? "no-preference" : "reduce", viewport: { width: 1440, height: 1000 } });
    try {
      await instrument(context, weak);
      const page = await context.newPage(); await page.goto("http://127.0.0.1:3196/");
      const disclosure = page.locator(".service-disclosure");
      await disclosure.locator("summary").hover(); await expect(disclosure).toHaveAttribute("open", "");
      expect(await page.evaluate(() => window.menuTransitions)).toEqual([]);
      await page.keyboard.press("Escape"); await expect(disclosure).not.toHaveAttribute("open", "");
      expect(await page.locator(".service-disclosure-trigger > svg").evaluate(node => parseFloat(getComputedStyle(node).transitionDuration))).toBeLessThanOrEqual(.00001);
    } finally { await context.close(); }
  }
});

test("desktop service disclosure remains available without JavaScript", async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 1440, height: 900 } });
  try {
    const page = await context.newPage(); await page.goto("http://127.0.0.1:3196/");
    const trigger = page.locator(".service-disclosure-trigger");
    await trigger.focus(); await trigger.press("Enter");
    await expect(page.locator(".service-mega-menu")).toBeVisible();
    await trigger.press("Space"); await expect(page.locator(".service-mega-menu")).toBeHidden();
  } finally { await context.close(); }
});
