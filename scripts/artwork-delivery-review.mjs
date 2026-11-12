import { spawn } from "node:child_process";
import { writeFile } from "node:fs/promises";
import assert from "node:assert/strict";
import { chromium } from "@playwright/test";
import sharp from "sharp";

const origin = "http://127.0.0.1:3193";
const server = spawn(process.execPath, ["node_modules/next/dist/bin/next", "start", "-p", "3193", "-H", "127.0.0.1"], { stdio: ["ignore", "pipe", "pipe"] });
let logs = "", browser;
server.stdout.on("data", value => logs += value);
server.stderr.on("data", value => logs += value);
const cases = [];
try {
  let ready = false;
  for (let attempt = 0; attempt < 80; attempt++) {
    try { if ((await fetch(origin)).ok) { ready = true; break; } } catch {}
    await new Promise(resolve => setTimeout(resolve, 250));
  }
  assert(ready, logs);
  browser = await chromium.launch({ channel: process.env.PLAYWRIGHT_CHANNEL || "chrome", headless: true });
  for (const size of [{ width: 390, height: 844, dpr: 1 }, { width: 390, height: 844, dpr: 3 }, { width: 1440, height: 1000, dpr: 1 }]) {
    const context = await browser.newContext({ viewport: { width: size.width, height: size.height }, deviceScaleFactor: size.dpr, serviceWorkers: "block", reducedMotion: "reduce" });
    const page = await context.newPage(), heroRequests = [];
    page.on("request", request => { if (request.resourceType() === "image" && decodeURIComponent(request.url()).includes("hero-home")) heroRequests.push(request.url()); });
    await page.goto(origin);
    await page.waitForFunction(() => { const image = document.querySelector(".hero-image"); return image instanceof HTMLImageElement && image.complete && image.naturalWidth > 0; });
    const source = await page.locator(".hero-image").evaluate(image => image.currentSrc);
    const response = await context.request.get(source, { headers: { Accept: "image/webp" } });
    assert(response.ok());
    const body = await response.body(), metadata = await sharp(body).metadata();
    assert.equal(metadata.hasAlpha, true);
    assert(body.length < 200 * 1024, "Hero transfer should stay bounded: " + body.length);
    assert.equal(new Set(heroRequests).size, 1, "Only the selected picture source should download");
    if (size.width < 768) { assert(source.includes("-mobile.png")); assert(metadata.width <= 640, "Mobile export must not upscale"); assert(body.length < 90 * 1024, "Mobile transfer budget"); }
    cases.push({ viewport: size, source: new URL(source).pathname + new URL(source).search, deliveredFormat: metadata.format, width: metadata.width, height: metadata.height, hasAlpha: metadata.hasAlpha, encodedBytes: body.length, heroDownloads: new Set(heroRequests).size });
    await context.close();
  }
  await writeFile("artifacts/transparent-artwork-delivery.json", JSON.stringify({ passed: true, cases, limits: "Local image-transfer and alpha checks, including DPR 3; this is not a network/CPU performance score." }, null, 2));
  console.log(JSON.stringify({ passed: true, cases }, null, 2));
} finally { await browser?.close(); server.kill("SIGTERM"); }
