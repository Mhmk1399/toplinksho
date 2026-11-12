import assert from "node:assert/strict";
import { readdir, readFile, writeFile, stat } from "node:fs/promises";
import sharp from "sharp";

const inspect = process.argv.includes("--inspect");
const visuals = JSON.parse(await readFile("content/visuals.fa.json", "utf8"));
const images = inspect
  ? (await readdir("public/images")).filter(file => /\.(png|webp)$/.test(file)).map(file => `public/images/${file}`)
  : [...Object.values(visuals).map(image => `public${image.src}`), ...["home", "about", "services", "contact", "404"].flatMap(key => [`public/images/hero-${key}.png`, `public/images/hero-${key}-mobile.png`])];
const results = [];
for (const file of images) {
  const image = sharp(file);
  const metadata = await image.metadata();
  const result = { file, format: metadata.format, width: metadata.width, height: metadata.height, alpha: metadata.hasAlpha, bytes: (await stat(file)).size };
  if (metadata.hasAlpha) {
    const { data, info } = await image.ensureAlpha().raw().toBuffer({ resolveWithObject: true });
    let transparent = 0, visible = 0, transparentBorder = 0, border = 0;
    for (let y = 0; y < info.height; y++) {
      for (let x = 0; x < info.width; x++) {
        const alpha = data[(y * info.width + x) * info.channels + info.channels - 1];
        if (alpha === 0) transparent++;
        if (alpha >= 32) visible++;
        if (x === 0 || y === 0 || x === info.width - 1 || y === info.height - 1) {
          border++; if (alpha === 0) transparentBorder++;
        }
      }
    }
    result.transparentFraction = transparent / (info.width * info.height);
    result.visibleFraction = visible / (info.width * info.height);
    result.transparentBorderFraction = transparentBorder / border;
  }
  if (!inspect) {
    assert.equal(result.format, "png", file + " must be PNG");
    assert.equal(result.alpha, true, file + " needs real alpha");
    assert(result.transparentFraction > 0.2, file + " needs transparent empty space");
    assert(result.visibleFraction > 0.025, file + " needs a visible subject");
    assert(result.transparentBorderFraction > 0.98, file + " must have clear edges");
  }
  results.push(result);
}
if (!inspect) await writeFile("artifacts/transparent-artwork-audit.json", JSON.stringify({ passed: true, assets: results }, null, 2));
console.log(JSON.stringify(inspect ? { assets: results } : { passed: true, transparentPngs: results.length, report: "artifacts/transparent-artwork-audit.json" }, null, 2));
