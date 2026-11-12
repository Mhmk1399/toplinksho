import assert from "node:assert/strict";
import { readFile, writeFile } from "node:fs/promises";
import sharp from "sharp";

// Only resize/re-encode alpha already supplied by imagegen; never synthesize a matte.
const manifest = JSON.parse(await readFile("artifacts/transparent-artwork-source.json", "utf8"));
const png = { compressionLevel: 9, adaptiveFiltering: true };
for (const entry of manifest.entries) {
  const image = sharp(entry.source);
  assert.equal((await image.metadata()).hasAlpha, true, entry.id + " requires source transparency");
  await image.resize({ width: 1024, withoutEnlargement: true })
    .extend({ top: 4, bottom: 4, left: 4, right: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png(png).toFile(entry.path);
}
const heroExports = [];
for (const key of ["home", "about", "services", "contact", "404"]) {
  const source = `public/images/hero-${key}.webp`;
  const image = sharp(source);
  assert.equal((await image.metadata()).hasAlpha, true, source + " requires source transparency");
  const file = `public/images/hero-${key}.png`;
  await image.extend({ top: 4, bottom: 4, left: 4, right: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } }).png(png).toFile(file);
  const mobile = `public/images/hero-${key}-mobile.png`;
  const mobileSource = `public/images/hero-${key}-mobile.webp`;
  assert.equal((await sharp(mobileSource).metadata()).hasAlpha, true, mobileSource + " requires source transparency");
  await sharp(mobileSource).png(png).toFile(mobile);
  heroExports.push({ source, file, mobileSource, mobile, operation: "Lossless PNG export of existing desktop/mobile alpha; transparent desktop padding, original bounded mobile pixels" });
}
await writeFile("artifacts/transparent-hero-exports.json", JSON.stringify({ entries: heroExports }, null, 2));
console.log(`Prepared ${manifest.entries.length} transparent service PNGs and ${heroExports.length * 2} hero PNGs.`);
