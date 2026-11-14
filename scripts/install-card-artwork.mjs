import { readdir, readFile, writeFile, mkdir, access } from "node:fs/promises";
import { createHash } from "node:crypto";
import assert from "node:assert/strict";
import sharp from "sharp";

const partial = process.argv.includes("--partial");
const inventory = JSON.parse(await readFile("artifacts/card-artwork-inventory.json", "utf8")).entries;
const directory = "artifacts/card-artwork-generation";
const files = (await readdir(directory)).filter(file => /^batch-\d+\.json$/.test(file)).sort();
const receipts = (await Promise.all(files.map(async file => JSON.parse(await readFile(directory + "/" + file, "utf8")).entries))).flat();
const byKey = new Map(receipts.filter(item => item.source).map(item => [item.key, item]));
if (!partial) assert.equal(byKey.size, inventory.length, "Every card subject needs a generated image");
await mkdir("public/images/cards", { recursive: true });
let previous = [];
try { previous = JSON.parse(await readFile("artifacts/card-artwork-installed.json", "utf8")).entries; } catch {}
const catalog = {}, installed = [], failures = [];
for (const item of inventory) {
  const receipt = byKey.get(item.key); if (!receipt) continue;
  const existing = previous.find(entry => entry.key === item.key && entry.source === receipt.source);
  if (existing) {
    try { await access("public" + existing.src); catalog[item.key] = { src: existing.src, alt: existing.alt, title: item.title, context: item.context }; installed.push(existing); continue; } catch {}
  }
  try {
    const source = sharp(receipt.source), metadata = await source.metadata();
    assert.equal(metadata.format, "png"); assert.equal(metadata.hasAlpha, true, "Missing real alpha");
    const alpha = await source.clone().extractChannel("alpha").raw().toBuffer();
    let transparent = 0, visible = 0;
    for (const value of alpha) { if (value === 0) transparent++; if (value >= 32) visible++; }
    assert(transparent / alpha.length > .15, "Opaque backdrop still present");
    assert(visible / alpha.length > .025, "Subject is not visible");
    const png = await source.resize({ width: 768, withoutEnlargement: true })
      .extend({ top: 4, right: 4, bottom: 4, left: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .png({ compressionLevel: 9, adaptiveFiltering: true }).toBuffer();
    const hash = createHash("sha256").update(png).digest("hex");
    const src = item.file.replace(/\.png$/, "-" + hash.slice(0, 10) + ".png");
    await writeFile("public" + src, png);
    const entry = { key: item.key, src, alt: "تصویرسازی " + item.title, title: item.title, context: item.context, source: receipt.source, hash, bytes: png.length, transparentFraction: transparent / alpha.length };
    catalog[item.key] = { src, alt: entry.alt, title: item.title, context: item.context };
    installed.push(entry);
  } catch (error) { failures.push({ key: item.key, source: receipt.source, error: String(error) }); }
}
assert.equal(new Set(installed.map(item => item.hash)).size, installed.length, "Duplicate image pixels");
await writeFile("artifacts/card-artwork-installed.json", JSON.stringify({ entries: installed, failures }, null, 2));
await writeFile("artifacts/card-artwork-failures.json", JSON.stringify({ entries: failures }, null, 2));
if (!partial) assert.equal(failures.length, 0, "Correct the failed transparent assets before publishing");
await writeFile("content/card-artwork.fa.json", JSON.stringify(catalog, null, 2) + "\n");
const menu = {};
for (const path of ["/services/development", "/services/design", "/services/growth"]) menu[path] = catalog["route:" + path]?.src || "/images/services/" + path.split("/").at(-1) + ".png";
menu.featured = catalog["menu:growth-security"]?.src || "/images/services/growth.png";
await writeFile("content/menu-artwork.generated.json", JSON.stringify(menu, null, 2) + "\n");
console.log(JSON.stringify({ installed: installed.length, required: inventory.length, failures: failures.length, catalog: "content/card-artwork.fa.json" }));
