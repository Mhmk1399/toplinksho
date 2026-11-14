import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { test, expect } from "@playwright/test";
import { Select } from "@/components/ui/Select";
import AxeBuilder from "@axe-core/playwright";

const options = [{ label: "خدمات طراحی", options: [{ value: "web", label: "طراحی سایت" }, { value: "brand", label: "هویت برند" }] }, { label: "خدمات رشد", options: [{ value: "seo", label: "سئو" }, { value: "unavailable", label: "خدمت غیرفعال", disabled: true }] }];

test("shared select preserves native grouped, multiple, reset, loading and error semantics", async ({ page }) => {
  const single = renderToStaticMarkup(createElement(Select, { id: "single", name: "service", label: "خدمت", options, placeholder: "انتخاب خدمت", required: true, defaultValue: "web", help: "یک خدمت انتخاب کنید", "aria-describedby": "extra" }));
  const multiple = renderToStaticMarkup(createElement(Select, { id: "many", name: "services", label: "خدمات", options, multiple: true, defaultValue: ["web", "seo"], size: 4 }));
  const busy = renderToStaticMarkup(createElement(Select, { id: "busy", name: "busy", label: "دریافت خدمات", options: [], loading: true, loadingText: "در حال دریافت خدمات" }));
  const empty = renderToStaticMarkup(createElement(Select, { id: "empty", label: "فهرست خالی", options: [], emptyText: "خدمتی موجود نیست" }));
  const invalid = renderToStaticMarkup(createElement(Select, { id: "invalid", label: "انتخاب الزامی", options, error: "یک گزینه انتخاب کنید", help: "راهنما", placeholder: "انتخاب کنید", containerClassName: "fixture-field", labelClassName: "fixture-label" }));
  const numeric = renderToStaticMarkup(createElement(Select, { id: "number", name: "number", label: "مقدار عددی", options: [{ value: 1, label: "یک" }, { value: 2, label: "دو" }], defaultValue: 2, dir: "ltr" }));
  const escaped = renderToStaticMarkup(createElement(Select, { id: "escaped", label: "متن گزینه", options: [{ value: "safe", label: '<script id="injected">bad()</script>' }] }));
  await page.setContent(`<html lang="fa" dir="rtl"><head><title>آزمون سلکت</title></head><body><main><h1>فرم انتخاب</h1><span id="extra">اطلاعات بیشتر</span><form id="form">${single}${multiple}${busy}${empty}${invalid}${numeric}${escaped}</form></main></body></html>`);
  await expect(page.locator("#single")).toHaveAttribute("aria-describedby", "extra single-message");
  await expect(page.locator("#single")).toHaveValue("web");
  await page.getByText("خدمت", { exact: true }).click(); await expect(page.locator("#single")).toBeFocused();
  await page.keyboard.press("ArrowDown"); await page.keyboard.press("Enter");
  await expect(page.locator("#single")).toHaveValue("brand");
  await expect(page.locator("#single option[value='']")).toBeDisabled();
  await expect(page.locator("#single option[value='unavailable']")).toBeDisabled();
  await page.locator("#many").selectOption(["brand", "seo"]);
  const data = await page.locator("#form").evaluate(form => [...new FormData(form as HTMLFormElement).entries()]);
  expect(data).toEqual([["service", "brand"], ["services", "brand"], ["services", "seo"], ["number", "2"]]);
  await expect(page.locator("#busy")).toBeDisabled(); await expect(page.locator("#busy")).toHaveAttribute("aria-busy", "true");
  await expect(page.locator("#busy-message")).toHaveText("در حال دریافت خدمات");
  await expect(page.locator("#empty option")).toHaveText("خدمتی موجود نیست");
  await expect(page.locator("#invalid")).toHaveAttribute("aria-invalid", "true");
  await expect(page.locator("#invalid-message")).toHaveText("یک گزینه انتخاب کنید");
  expect(await page.locator("script#injected").count()).toBe(0);
  await page.locator("#form").evaluate(form => (form as HTMLFormElement).reset());
  await expect(page.locator("#single")).toHaveValue("web");
  await expect(page.locator("#many")).toHaveValues(["web", "seo"]);
  const report = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa"]).analyze();
  expect(report.violations).toEqual([]);
});

test("public filters use the shared select and submit without JavaScript", async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 390, height: 844 } });
  try {
    const page = await context.newPage();
    await page.goto("http://127.0.0.1:3196/portfolio");
    const field = page.getByLabel("خدمت مرتبط", { exact: true });
    await expect(field).toHaveAttribute("data-ui", "select");
    const value = "/services/development/web-development";
    await field.selectOption(value);
    await page.getByRole("button", { name: "نمایش", exact: true }).click();
    await expect(page).toHaveURL(/portfolio\?service=.*#projects$/);
    await expect(field).toHaveValue(value);
    expect(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)).toBe(false);
    await page.getByRole("link", { name: "پاک کردن فیلتر", exact: true }).click();
    await expect(field).toHaveValue("");
    await page.goto("http://127.0.0.1:3196/contact");
    await expect(page.locator('select[name="subject"]')).toHaveAttribute("data-ui", "select");
  } finally { await context.close(); }
});
