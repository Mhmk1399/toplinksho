import { spawn } from "node:child_process";
import { readFile, readdir, writeFile } from "node:fs/promises";
import assert from "node:assert/strict";
import { chromium } from "@playwright/test";

const catalog = JSON.parse(await readFile("content/card-artwork.fa.json", "utf8"));
const inventory = JSON.parse(await readFile("artifacts/card-artwork-inventory.json", "utf8")).entries;
assert.equal(Object.keys(catalog).length, inventory.length);
assert.equal(new Set(Object.values(catalog).map(item => item.src)).size, inventory.length);
const serviceData = JSON.parse(await readFile("content/services.fa.json", "utf8"));
const mainData = JSON.parse(await readFile("content/pages.fa.json", "utf8"));
const routes = ["/", ...serviceData.pages.map(p => p.path), ...mainData.pages.map(p => p.path), ...Object.keys(serviceData.legacyEditorial)];
const origin = "http://127.0.0.1:3195";
const server = spawn(process.execPath, ["node_modules/next/dist/bin/next", "start", "-p", "3195", "-H", "127.0.0.1"], { stdio: ["ignore", "pipe", "pipe"] });
let logs = "", browser;
server.stdout.on("data", data => logs += data); server.stderr.on("data", data => logs += data);
try {
 let ready = false;
 for (let i = 0; i < 80; i++) { try { if ((await fetch(origin)).ok) { ready = true; break; } } catch {} await new Promise(r => setTimeout(r, 250)); }
 assert(ready, logs);
 browser = await chromium.launch({ channel: process.env.PLAYWRIGHT_CHANNEL || "chrome", headless: true });
 const context = await browser.newContext({ locale: "fa-IR", reducedMotion: "reduce", serviceWorkers: "block" });
 const page = await context.newPage(), results = [];
 for (const path of routes) {
  const response = await fetch(origin + path); assert.equal(response.status, 200);
  const cards = await page.evaluate(html => {
   const document = new DOMParser().parseFromString(html, "text/html");
   return [...document.querySelectorAll("main .feature-card .card-visual")].map(node => {
    const img = node.querySelector(".card-visual-image"), url = new URL(img.getAttribute("src"), "http://localhost");
    return { key: node.getAttribute("data-artwork-key"), src: url.searchParams.get("url") || url.pathname, loading: img.getAttribute("loading") };
   });
  }, await response.text());
  assert.equal(new Set(cards.map(card => card.src)).size, cards.length, path + " repeats an illustration for different cards");
  for (const card of cards) { assert(catalog[card.key], path + " missing key: " + card.key); assert.equal(card.src, catalog[card.key].src); assert.equal(card.loading, "lazy"); }
  results.push({ path, cards: cards.length, uniqueImages: cards.length, fullyMapped: true });
 }
 async function walk(path) { return (await Promise.all((await readdir(path, { withFileTypes: true })).map(item => item.isDirectory() ? walk(path + "/" + item.name) : [path + "/" + item.name]))).flat(); }
 for (const file of (await walk(".next/static/chunks")).filter(file => file.endsWith(".js"))) assert(!(await readFile(file, "utf8")).includes("deliverable:/services/"), "Full artwork registry entered client bundle: " + file);
 const theme = JSON.parse(await readFile("theme/theme.json", "utf8"));
 const entries = Object.entries(catalog), screenshots = [];
 const escape = text => text.replace(/[&<>\"]/g, value => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[value]));
 await page.goto(origin + "/offline.html");
 await page.setViewportSize({ width: 1440, height: 1500 });
 for (let start = 0; start < entries.length; start += 36) {
  const sheet = entries.slice(start, start + 36);
  await page.setContent(`<html lang="fa" dir="rtl"><style>@font-face{font-family:local;src:url(${origin}/fonts/vazirmatn-arabic.woff2)}*{box-sizing:border-box}body{margin:0;padding:16px;background:${theme.colors.background};color:${theme.colors.text};font-family:local,sans-serif}.grid{display:grid;grid-template-columns:repeat(6,minmax(0,1fr));gap:12px}.item{border:1px solid ${theme.colors.accent};border-radius:16px;padding:8px;min-width:0;background:${theme.colors.surface}}img{display:block;width:100%;height:165px;object-fit:contain}p{margin:4px 0;font-size:11px;line-height:1.7}</style><div class="grid">${sheet.map(([key,item]) => `<div class="item"><img src="${origin}${item.src}" alt=""><p>${escape(item.title)}</p><p dir="ltr">${escape(key)}</p></div>`).join("")}</div></html>`);
  await page.evaluate(async () => { await document.fonts.ready; await Promise.all([...document.images].map(image => image.decode())); });
  const file = `artifacts/card-artwork-sheet-${Math.floor(start / 36) + 1}.png`;
  await page.screenshot({ path: file, fullPage: true }); screenshots.push(file);
 }
 await writeFile("artifacts/card-artwork-review.json", JSON.stringify({ passed: true, assets: entries.length, routes: results, fullCatalogExcludedFromClient: true, screenshots }, null, 2));
 console.log(JSON.stringify({ passed: true, assets: entries.length, routes: results.length, screenshots: screenshots.length }));
 await context.close();
} finally { await browser?.close(); server.kill("SIGTERM"); }
