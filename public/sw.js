/* Generated with a content revision before each production build. */
const PREFIX = "toplinksho-";
const VERSION = "8f822b950982911b";
const SHELL = PREFIX + "shell-" + VERSION;
const PAGES = PREFIX + "pages-" + VERSION;
const ASSETS = PREFIX + "assets-" + VERSION;
const PUBLIC_ROUTES = new Set(["/","/about-us","/services","/contact","/services/web-design","/services/social-media","/services/branding","/services/google-ads","/services/campaigns","/services/graphic-design","/services/content-production","/services/seo","/services/online-advertising"]);
const CORE = ["/offline.html", "/images/logo.webp", "/icons/icon-192.png", "/icons/icon-512.png"];
self.addEventListener("install", event => {
  // An update waits for existing tabs to close; never interrupt an unsaved form.
  event.waitUntil(caches.open(SHELL).then(cache => cache.addAll(CORE)));
});
self.addEventListener("activate", event => {
  event.waitUntil((async () => {
    for (const key of await caches.keys()) if (key.startsWith(PREFIX) && ![SHELL, PAGES, ASSETS].includes(key)) await caches.delete(key);
    await self.clients.claim();
  })());
});
async function store(cacheName, request, response, max) {
  if (!response.ok || response.type === "opaque" || /no-store|private/i.test(response.headers.get("cache-control") || "") || response.headers.has("set-cookie")) return;
  const size = Number(response.headers.get("content-length") || 0);
  if (size > 3 * 1024 * 1024) return;
  try {
    const cache = await caches.open(cacheName);
    await cache.put(request, response);
    const keys = await cache.keys();
    for (const key of keys.slice(0, Math.max(0, keys.length - max))) await cache.delete(key);
  } catch { /* Storage quota/private mode must not break normal navigation. */ }
}
self.addEventListener("fetch", event => {
  const request = event.request;
  const url = new URL(request.url);
  // Never cache personal data, API mutations, private pages, RSC payloads or cross-origin requests.
  if (request.method !== "GET" || url.origin !== self.location.origin || url.pathname.startsWith("/admin") || url.pathname.startsWith("/api/") || request.headers.has("rsc") || url.searchParams.has("_rsc") || request.headers.has("next-router-prefetch") || request.headers.has("range")) return;
  if (request.mode === "navigate") {
    if (!PUBLIC_ROUTES.has(url.pathname) || url.search) return;
    event.respondWith((async () => {
      try {
        const response = await fetch(request);
        if (response.ok && response.headers.get("content-type")?.includes("text/html")) event.waitUntil(store(PAGES, url.href, response.clone(), 20));
        return response;
      } catch {
        return (await caches.open(PAGES)).match(url.href, { ignoreVary: true }).then(async cached => cached || (await caches.open(SHELL)).match("/offline.html"));
      }
    })());
    return;
  }
  const cacheable = url.pathname.startsWith("/_next/static/") || url.pathname.startsWith("/fonts/") || url.pathname.startsWith("/icons/") || url.pathname.startsWith("/images/") || url.pathname === "/_next/image";
  if (!cacheable) return;
  event.respondWith((async () => {
    const cache = await caches.open(ASSETS);
    const cached = await cache.match(request);
    if (cached) return cached;
    const response = await fetch(request);
    event.waitUntil(store(ASSETS, request, response.clone(), 100));
    return response;
  })());
});
