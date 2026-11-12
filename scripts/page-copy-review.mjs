import { spawn } from "node:child_process";
import { readFile, writeFile } from "node:fs/promises";
import assert from "node:assert/strict";
import { chromium } from "@playwright/test";

const baselineMode = process.argv.includes("--baseline");
const services = JSON.parse(await readFile("content/services.fa.json", "utf8"));
const pages = JSON.parse(await readFile("content/pages.fa.json", "utf8"));
const home = JSON.parse(await readFile("content/home.fa.json", "utf8"));
const legacyPaths = ["campaigns", "google-ads", "graphic-design", "content-production", "online-advertising"].map(slug => "/services/" + slug);
const entries = [{ path: "/", heroDescription: home.hero.description }, ...pages.pages, ...services.pages, ...legacyPaths.map(path => ({ path, ...services.legacyEditorial?.[path] }))];
const origin = "http://127.0.0.1:3194";
const server = spawn(process.execPath, ["node_modules/next/dist/bin/next", "start", "-p", "3194", "-H", "127.0.0.1"], { stdio: ["ignore", "pipe", "pipe"] });
let browser, logs = "";
server.stdout.on("data", data => logs += data); server.stderr.on("data", data => logs += data);
try {
  let ready = false;
  for (let attempt = 0; attempt < 80; attempt++) {
    try { if ((await fetch(origin)).ok) { ready = true; break; } } catch {}
    await new Promise(resolve => setTimeout(resolve, 250));
  }
  assert(ready, logs);
  browser = await chromium.launch({ channel: process.env.PLAYWRIGHT_CHANNEL || "chrome", headless: true });
  const page = await browser.newPage();
  const results = [];
  for (const entry of entries) {
    const response = await fetch(origin + entry.path); assert.equal(response.status, 200, entry.path);
    const html = await response.text();
    const result = await page.evaluate(source => {
      const document = new DOMParser().parseFromString(source, "text/html");
      const text = node => node?.textContent?.replace(/\s+/g, " ").trim() || "";
      const paragraphs = [...document.querySelectorAll("main p")].filter(node => !node.closest(".feature-card, form, details, nav"));
      return { h1: text(document.querySelector("h1")), hero: text(document.querySelector(".hero-description")), paragraphs: paragraphs.map(text), cards: [...document.querySelectorAll("main .feature-card-description")].map(text), h1Count: document.querySelectorAll("h1").length };
    }, html);
    result.nonCardWords = result.paragraphs.join(" ").split(/\s+/).filter(Boolean).length;
    result.path = entry.path;
    if (!baselineMode) {
      assert.equal(result.hero, entry.heroDescription, entry.path + " SSR hero copy");
      for (const paragraph of entry.bodyParagraphs || []) assert(result.paragraphs.includes(paragraph), entry.path + " SSR body copy");
      assert.equal(result.h1Count, 1, entry.path);
    }
    results.push(result);
  }
  const baselineFile = "artifacts/page-copy-baseline.json";
  if (baselineMode) {
    await writeFile(baselineFile, JSON.stringify({ routes: results }, null, 2));
    console.log("Saved baseline for " + results.length + " public pages.");
  } else {
    const baseline = JSON.parse(await readFile(baselineFile, "utf8"));
    const comparisons = results.map(result => {
      const before = baseline.routes.find(item => item.path === result.path); assert(before, result.path);
      assert.equal(result.h1, before.h1, result.path + " keep H1 concise and unchanged");
      assert.deepEqual(result.cards, before.cards, result.path + " keep card descriptions compact");
      assert(result.nonCardWords > before.nonCardWords, result.path + " add useful non-card copy");
      return { path: result.path, before: before.nonCardWords, after: result.nonCardWords, h1Unchanged: true, cardsUnchanged: true };
    });
    await writeFile("artifacts/page-copy-review.json", JSON.stringify({ passed: true, routes: comparisons, note: "Word counts measure implementation coverage, not a Google ranking target." }, null, 2));
    console.log(JSON.stringify({ passed: true, routes: comparisons.length, headingsUnchanged: true, cardsUnchanged: true, allCopyServerRendered: true }));
  }
} finally { await browser?.close(); server.kill("SIGTERM"); }
