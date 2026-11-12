import { readFile, writeFile, mkdir, readdir } from "node:fs/promises";
import { createHash } from "node:crypto";
import { join } from "node:path";
import sharp from "sharp";
import { publicEntries } from "../lib/page-registry.ts";

await mkdir("public/icons", { recursive: true });
await mkdir("public/social", { recursive: true });
const home = JSON.parse(await readFile("content/home.fa.json", "utf8"));
const theme = JSON.parse(await readFile("theme/theme.json", "utf8"));
const logo = await readFile("public/images/logo.webp");
for (const [file, size, inset] of [["icon-192.png", 192, 26], ["icon-512.png", 512, 68], ["maskable-512.png", 512, 106], ["apple-touch-icon.png", 180, 24]]) {
  const mark = await sharp(logo).resize({ width: size - inset * 2, height: size - inset * 2, fit: "inside" }).png().toBuffer();
  await sharp({ create: { width: size, height: size, channels: 4, background: theme.colors.background } }).composite([{ input: mark, gravity: "centre" }]).png().toFile(`public/icons/${file}`);
}
const pages = publicEntries.map(page => ({ id: page.socialId, title: page.path === "/" ? home.seo.socialTitle : page.title, image: page.image }));
const escape = value => value.replace(/[&<>"]/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[char]));
for (const page of pages) {
  const art = await sharp(`public${page.image}`).resize({ width: 460, height: 460, fit: "inside" }).png().toBuffer();
  const mark = await sharp(logo).resize({ width: 210, height: 100, fit: "inside" }).png().toBuffer();
  const title = await sharp({ text: { text: `<span foreground="${theme.colors.text}">${escape(page.title)}</span>`, font: "Vazirmatn Bold", fontfile: "scripts/assets/Vazirmatn.ttf", width: 610, height: 180, align: "right", rgba: true } }).png().toBuffer();
  const background = Buffer.from('<svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg"><defs><radialGradient id="g"><stop stop-color="#303569"/><stop offset="1" stop-color="#0b0c14"/></radialGradient></defs><rect width="1200" height="630" fill="url(#g)"/><rect x="24" y="24" width="1152" height="582" rx="40" fill="none" stroke="#8279bd" stroke-opacity=".3"/><path d="M540 470H1120" stroke="#e02585" stroke-width="3"/></svg>'.replaceAll('#303569', theme.colors.blue).replaceAll('#0b0c14', theme.colors.background).replaceAll('#8279bd', theme.colors.accent).replaceAll('#e02585', theme.colors.pink));
  await sharp(background).composite([{ input: art, left: 40, top: 100 }, { input: mark, left: 910, top: 80 }, { input: title, left: 510, top: 260 }]).png().toFile(`public/social/${page.id}.png`);
}
const hash = createHash("sha256");
async function fingerprint(directory) {
  for (const entry of (await readdir(directory, { withFileTypes: true })).sort((a,b) => a.name.localeCompare(b.name))) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) await fingerprint(path);
    else { hash.update(path); hash.update(await readFile(path)); }
  }
}
for (const dir of ["app", "components", "lib", "content", "theme", "public/images", "public/fonts", "public/icons"]) await fingerprint(dir);
hash.update(await readFile("scripts/service-worker.js"));
hash.update(await readFile("public/offline.html"));
const routes = publicEntries.map(page => page.path);
const source = (await readFile("scripts/service-worker.js", "utf8")).replace("__REVISION__", hash.digest("hex").slice(0, 16)).replace("__PUBLIC_ROUTES__", JSON.stringify(routes));
await writeFile("public/sw.js", source);
console.log(`Generated 4 app icons, ${pages.length} social cards and a versioned service worker.`);
