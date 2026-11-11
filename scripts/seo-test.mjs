import assert from "node:assert/strict";
import { writeFile } from "node:fs/promises";
import sharp from "sharp";
import { pathToFileURL } from "node:url";
import { resolve } from "node:path";

const cases = [
  { url: "https://toplinksho.com", enabled: "true", preview: "", expected: true },
  { url: "https://toplinksho.com", enabled: "false", preview: "", expected: false },
  { url: "https://toplinksho.com", enabled: "true", preview: "preview", expected: false },
  { url: "http://localhost:3000", enabled: "true", preview: "", expected: false },
  { url: "https://127.0.0.1", enabled: "true", preview: "", expected: false },
];
let count = 0;
for (const [index, item] of cases.entries()) {
  process.env.APP_URL = item.url; process.env.SITE_INDEXABLE = item.enabled; process.env.VERCEL_ENV = item.preview;
  const seo = await import(pathToFileURL(resolve("lib/seo.ts")).href + "?case=" + index);
  assert.equal(seo.indexable, item.expected);
  const urls = new Set();
  const titles = new Set();
  for (const page of seo.publicPages) {
    const metadata = seo.pageMetadata(page.path);
    assert.equal(metadata.robots.index, item.expected);
    assert.equal(metadata.robots.follow, item.expected);
    assert.equal(metadata.alternates.canonical, seo.absoluteUrl(page.path));
    assert.equal(metadata.openGraph.url, metadata.alternates.canonical);
    assert.equal(metadata.openGraph.locale, "fa_IR");
    assert.equal(metadata.twitter.card, "summary_large_image");
    assert(metadata.description.length > 40);
    assert(!urls.has(metadata.alternates.canonical)); urls.add(metadata.alternates.canonical);
    assert(!titles.has(metadata.title.absolute)); titles.add(metadata.title.absolute);
    count++;
  }
  assert.equal(urls.size, 13);
}
process.env.APP_URL = "https://toplinksho.com"; process.env.SITE_INDEXABLE = "true"; process.env.VERCEL_ENV = "";
const { publicPages } = await import("../lib/seo.ts");
const { pageStructuredData } = await import("../lib/structured-data.ts");
for (const page of publicPages) {
  const graph = pageStructuredData(page.path);
  assert.equal(graph["@context"], "https://schema.org");
  const nodes = graph["@graph"];
  assert(nodes.some(node => node["@type"] === "ProfessionalService"));
  assert(nodes.some(node => node["@type"] === "WebSite"));
  assert(!JSON.stringify(graph).includes("aggregateRating"));
  if (page.kind === "service") {
    const { getService } = await import("../lib/services.ts");
    const service = getService(page.slug);
    assert.deepEqual(nodes.find(node => node["@type"] === "FAQPage").mainEntity.map(item => item.name), service.faq.map(faq => faq.question));
  }
  const image = await sharp("public/social/" + (page.slug || page.kind) + ".png").metadata();
  assert.equal(image.width, 1200); assert.equal(image.height, 630);
}
const { default: robots } = await import("../app/robots.ts");
const { default: sitemap } = await import("../app/sitemap.ts");
assert.equal(sitemap().length, 13);
assert(sitemap().every(item => !item.url.includes("/admin") && !item.lastModified));
assert(robots().rules.disallow.includes("/admin"));
const { default: manifest } = await import("../app/manifest.ts");
assert.equal(manifest().display, "standalone"); assert.equal(manifest().dir, "rtl");
for (const icon of manifest().icons) {
  const metadata = await sharp("public" + icon.src).metadata();
  assert.equal(metadata.width + "x" + metadata.height, icon.sizes);
}
await writeFile("artifacts/seo-results.json", JSON.stringify({ passed: true, metadataChecks: count, publicGraphs: 13, socialCards: 13, indexingModes: cases.length, productionSitemap: 13, forgedRatings: false }, null, 2));
console.log("PASS SEO: 65 page/mode combinations, 13 graphs/social images, production sitemap/robots and PWA icons");
