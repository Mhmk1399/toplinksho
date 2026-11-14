import { writeFile, readFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import { servicePages, mainPages } from "../lib/page-registry.ts";

const home = JSON.parse(await readFile("content/home.fa.json", "utf8"));
const items = [];
function add(key, title, description, context) {
  items.push({ key, title, description, context, file: "/images/cards/" + createHash("sha256").update(key).digest("hex").slice(0, 16) + ".png" });
}
for (const page of servicePages) {
  add("route:" + page.path, page.title, page.description, page.path);
  if (!["catalog", "group"].includes(page.kind)) {
    add("fit:" + page.path, "کاربرد و مخاطب " + page.title, page.fit || page.intro, page.path);
    (page.deliverables || []).forEach((text, index) => add("deliverable:" + page.path + ":" + index, text, page.title + "؛ " + page.description, page.path));
  }
}
for (const page of mainPages) {
  if (page.kind === "case") add("route:" + page.path, page.title, page.description, page.path);
  if (["about", "case", "pricing"].includes(page.kind)) page.sections.forEach((section, index) => add("section:" + page.path + ":" + index, section.title, section.text, page.path));
}
for (const item of home.ai.items) add("ai:" + item.id, item.title, item.description, "/");
add("menu:growth-security", "مسیر رشد و امنیت", "قطب‌نمای شیشه‌ای و سپر محافظ در مسیر رشد کسب‌وکار؛ تصویر ویژهٔ بخش معرفی مگامنو", "navigation");
await writeFile("artifacts/card-artwork-inventory.json", JSON.stringify({ entries: items }, null, 2));
console.log(JSON.stringify({ total: items.length, routes: items.filter(i => i.key.startsWith("route:")).length, fit: items.filter(i => i.key.startsWith("fit:")).length, deliverables: items.filter(i => i.key.startsWith("deliverable:")).length, other: items.filter(i => /^(ai|section):/.test(i.key)).length }));
