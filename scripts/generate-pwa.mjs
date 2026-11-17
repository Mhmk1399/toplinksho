import { readFile, writeFile, mkdir, readdir } from "node:fs/promises";
import { createHash } from "node:crypto";
import { join } from "node:path";
import sharp from "sharp";
import nextEnv from "@next/env";
import { publicEntries } from "../lib/page-registry.ts";

// Prebuild runs outside Next's runtime, so resolve the same public CDN setting.
nextEnv.loadEnvConfig(process.cwd());
const { assetBaseUrl } = await import("../lib/assets.ts");

const home = JSON.parse(await readFile("content/home.fa.json", "utf8"));
const theme = JSON.parse(await readFile("theme/theme.json", "utf8"));
async function optionalFile(file) {
  try { return await readFile(file); }
  catch (error) { if (error.code === "ENOENT") return null; throw error; }
}
const logo = await optionalFile("public/images/logo.webp");
const icons = [["icon-192.png", 192, 26], ["icon-512.png", 512, 68], ["maskable-512.png", 512, 106], ["apple-touch-icon.png", 180, 24]];
let generatedIcons = 0, generatedSocial = 0;
if (logo) {
  await mkdir("public/icons", { recursive: true });
  for (const [file, size, inset] of icons) {
    const mark = await sharp(logo).resize({ width: size - inset * 2, height: size - inset * 2, fit: "inside" }).png().toBuffer();
    await sharp({ create: { width: size, height: size, channels: 4, background: theme.colors.background } }).composite([{ input: mark, gravity: "centre" }]).png().toFile(`public/icons/${file}`);
    generatedIcons++;
  }
} else {
  // Runtime artwork lives in the bucket; checked-in PWA icons still work offline.
  for (const [file] of icons) {
    if (!await optionalFile(`public/icons/${file}`)) throw new Error(`Missing public/icons/${file}; keep local PWA icons or provide public/images/logo.webp to regenerate them.`);
  }
}
const pages = publicEntries.map(page => ({ id: page.socialId, title: page.path === "/" ? home.seo.socialTitle : page.title, image: page.image }));
const escape = value => value.replace(/[&<>"]/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[char]));
for (const page of logo ? pages : []) {
  const input = await optionalFile(`public${page.image}`);
  if (!input) continue;
  if (!generatedSocial) await mkdir("public/social", { recursive: true });
  const art = await sharp(input).resize({ width: 460, height: 460, fit: "inside" }).png().toBuffer();
  const mark = await sharp(logo).resize({ width: 210, height: 100, fit: "inside" }).png().toBuffer();
  const title = await sharp({ text: { text: `<span foreground="${theme.colors.text}">${escape(page.title)}</span>`, font: "Vazirmatn Bold", fontfile: "scripts/assets/Vazirmatn.ttf", width: 610, height: 180, align: "right", rgba: true } }).png().toBuffer();
  const background = Buffer.from('<svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg"><defs><radialGradient id="g"><stop stop-color="#303569"/><stop offset="1" stop-color="#0b0c14"/></radialGradient></defs><rect width="1200" height="630" fill="url(#g)"/><rect x="24" y="24" width="1152" height="582" rx="40" fill="none" stroke="#8279bd" stroke-opacity=".3"/><path d="M540 470H1120" stroke="#e02585" stroke-width="3"/></svg>'.replaceAll('#303569', theme.colors.blue).replaceAll('#0b0c14', theme.colors.background).replaceAll('#8279bd', theme.colors.accent).replaceAll('#e02585', theme.colors.pink));
  await sharp(background).composite([{ input: art, left: 40, top: 100 }, { input: mark, left: 910, top: 80 }, { input: title, left: 510, top: 260 }]).png().toFile(`public/social/${page.id}.png`);
  generatedSocial++;
}
const hash = createHash("sha256");
async function fingerprint(directory, optional = false) {
  let entries;
  try { entries = await readdir(directory, { withFileTypes: true }); }
  catch (error) {
    if (optional && error.code === "ENOENT") { hash.update(`${directory}:absent`); return; }
    throw error;
  }
  for (const entry of entries.sort((a,b) => a.name.localeCompare(b.name))) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) await fingerprint(path);
    else { hash.update(path); hash.update(await readFile(path)); }
  }
}
for (const dir of ["app", "components", "lib", "content", "theme", "public/fonts", "public/icons"]) await fingerprint(dir);
await fingerprint("public/images", true);
hash.update(await readFile("scripts/service-worker.js"));
hash.update(await readFile("public/offline.html"));
hash.update(assetBaseUrl);
const routes = publicEntries.map(page => page.path);
const source = (await readFile("scripts/service-worker.js", "utf8")).replace("__REVISION__", hash.digest("hex").slice(0, 16)).replace("__PUBLIC_ROUTES__", JSON.stringify(routes)).replace("__ASSET_BASE_URL__", JSON.stringify(assetBaseUrl));
await writeFile("public/sw.js", source);
console.log(`Generated ${generatedIcons} app icons, ${generatedSocial} social cards and a versioned service worker.${logo ? "" : " Preserved 4 local icons; image/social artwork is served from the bucket."}`);
